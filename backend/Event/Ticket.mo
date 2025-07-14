import Principal "mo:base/Principal";

module {
  public type TicketId = Nat;

  public type TicketKind = {
    #Seated: { seatInfo: Text };
    #Seatless;
  };

  public type Ticket = {
    eventID: Text;
    owner: Principal;
    price: Nat;
    kind: TicketKind;
    isValid: Bool;
  };

  public func createTicket(eventId: Text, owner: Principal, price: Nat, kind: TicketKind): Ticket {
    {
      eventID = eventId;
      owner = owner;
      price = price;
      kind = kind;
      isValid = true;
    }
  };

  public func updateTicketPrice(ticket: Ticket, price: Nat): Ticket {
    { ticket with price = price }
  };

  public func transferTicket(ticket: Ticket, newOwner: Principal): Ticket {
    { ticket with owner = newOwner }
  };

  public func emptyTicket(): Ticket {
    {
      eventID = "";
      owner = Principal.fromText("aaaaa-aa");
      price = 0;
      kind = #Seatless;
      isValid = false;
    }
  };
}
