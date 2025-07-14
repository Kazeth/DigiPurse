import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";

module {
    public type User = {
        username : Text;
        joinDate : Time.Time;
        userAddress : Text;
        isOrganizer : Bool;
        ticketIDs : [Nat];
    };

    public func createUser(username : Text, address : Text, isOrganizer : Bool) : User {
        {
            username = username;
            joinDate = Time.now();
            userAddress = address;
            isOrganizer = isOrganizer;
            ticketIDs = [];
        }
    };

    public func addTicketToUser(user : User, ticketId : Nat) : User {
        { user with ticketIDs = Array.append(user.ticketIDs, [ticketId]) };
    };

    public func removeTicketFromUser(user : User, ticketId : Nat) : User {
        { user with ticketIDs = Array.filter<Nat>(user.ticketIDs, func(id) { id != ticketId }) };
    };
};