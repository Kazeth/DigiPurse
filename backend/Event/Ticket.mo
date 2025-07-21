import Principal "mo:base/Principal";
import Types "../types";
module {

  public func createTicket(eventId: Text, ticketId: Text, owner: Principal, price: Nat, kind: Types.TicketKind): Types.Ticket {
    {
      id = ticketId;
      eventID = eventId;
      owner = owner;
      price = price;
      kind = kind;
      valid = true;
    }
  };

  public func updateTicketPrice(ticket: Types.Ticket, price: Nat): Types.Ticket {
    { ticket with price = price }
  };

  public func transferTicket(ticket: Types.Ticket, newOwner: Principal): Types.Ticket {
    { ticket with owner = newOwner }
  };

  public func emptyTicket(): Types.Ticket {
    {
      id = "";
      eventID = "";
      owner = Principal.fromText("aaaaa-aa");
      price = 0;
      kind = #Seatless;
      valid = false;
    }
  };
}
