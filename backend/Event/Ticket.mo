import Principal "mo:base/Principal";
import Types "../types";

actor class TicketActor() {
  public func createTicket(eventId : Text, ticketId : Nat, owner : Principal, price : Nat, kind : Types.TicketKind) : async Types.Ticket {
    {
      id = ticketId;
      eventID = eventId;
      owner = owner;
      price = price;
      kind = kind;
      valid = true;
    };
  };

  public func transferTicket(ticket : Types.Ticket, newOwner : Principal) : async Types.Ticket {
    { ticket with owner = newOwner };
  };

};
