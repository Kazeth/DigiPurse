import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import TrieMap "mo:base/TrieMap";
import Type "../types";

actor class EventActor() {

  stable var eventIdCounter : Nat = 0;

  stable var stableEvents : [(Text, Type.Event)] = [];
  private var events = TrieMap.TrieMap<Text, Type.Event>(Text.equal, Text.hash);

  system func preupgrade() {
    stableEvents := Iter.toArray(events.entries());
  };

  system func postupgrade() {
    events := TrieMap.fromEntries<Text, Type.Event>(Iter.fromArray(stableEvents), Text.equal, Text.hash);
  };

  public query func getAllEvents() : async [(Text, Type.Event)] {
    return Iter.toArray(events.entries());
  };

  public func createEvent(
    name : Text,
    organizerId : Text,
    desc : Text,
    date : Time.Time,
    duration : Nat,
    supply : Nat,
    prices : [Nat],
    kind : Type.TicketKind,
    valid : Bool,
  ) : async Type.Event {
    eventIdCounter += 1;

    let paddedNum = if (eventIdCounter < 10) {
      "00" # Nat.toText(eventIdCounter);
    } else if (eventIdCounter < 100) {
      "0" # Nat.toText(eventIdCounter);
    } else {
      Nat.toText(eventIdCounter);
    };

    let id : Text = "EV-" # paddedNum;

    let tempEvent : Type.Event = {
      id = id;
      organizerId = organizerId;
      name = name;
      description = desc;
      date = date;
      durationMinutes = duration;
      ticketSupply = supply;
      prices = prices;
      kind = kind;
      valid = valid;
    };
    events.put(id, tempEvent);

    return tempEvent;
  };


};
