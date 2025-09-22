import Principal "mo:base/Principal";
import Type "/types";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Time "mo:base/Time";

persistent actor class HistoryActor() {

  var stableHistories : [(Principal, [Type.History])] = [];
  private transient var histories = TrieMap.TrieMap<Principal, [Type.History]>(Principal.equal, Principal.hash);

  system func preupgrade() {
    stableHistories := Iter.toArray(histories.entries());
  };

  system func postupgrade() {
    histories := TrieMap.fromEntries<Principal, [Type.History]>(Iter.fromArray(stableHistories), Principal.equal, Principal.hash);
  };

  public query func getAllHistory() : async [(Principal, [Type.History])] {
    Iter.toArray(histories.entries());
  };

  public query func getAllUserHistories(user : Principal) : async [(Principal, [Type.History])] {
    let mapped = Iter.map<(Principal, [Type.History]), (Principal, [Type.History])>(
      histories.entries(),
      func((user, historyArr)) {
        let userHistories = Iter.toArray(
          Iter.filter<Type.History>(
            historyArr.vals(),
            func(t) { t.user == user },
          )
        );
        (user, userHistories);
      },
    );
    Iter.toArray(mapped);
  };

  public func insertHistory(
    user : Principal,
    title : Text,
    detail : Text,
    timestamp : Time.Time,
  ) : async Type.History {

    let tempHistory : Type.History = {
      user = user;
      title = title;
      detail = detail;
      timestamp = timestamp;
    };

    let existingHistories = switch (histories.get(user)) {
      case (?arr) { arr };
      case (null) { [] };
    };

    let updatedHistories = Array.append(existingHistories, [tempHistory]);
    histories.put(user, updatedHistories);

    return tempHistory;
  };

};
