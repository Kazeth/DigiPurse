import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Types "../types";

actor Identity {

    var identities = HashMap.HashMap<Principal, Types.Identity>(10, Principal.equal, Principal.hash);

    public query func getIdentity(user : Principal) : async ?Types.Identity {
        identities.get(user);
    };

    public func saveIdentity(user : Principal, data : Types.Identity) : async () {
        identities.put(user, data);
    };

    public func clearIdentity(user : Principal) : async () {
        ignore identities.remove(user);
    };
};
