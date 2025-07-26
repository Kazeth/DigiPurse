import Principal "mo:base/Principal";
import Type "../types";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Nat "mo:base/Nat";

persistent actor class TicketActor() {

  var ticketIdCounter : Nat = 0;

  var stableTickets : [(Text, Type.Ticket)] = [];
  private transient var tickets = TrieMap.TrieMap<Text, Type.Ticket>(Text.equal, Text.hash);

  system func preupgrade() {
    stableTickets := Iter.toArray(tickets.entries());
  };

  system func postupgrade() {
    tickets := TrieMap.fromEntries<Text, Type.Ticket>(Iter.fromArray(stableTickets), Text.equal, Text.hash);
  };

  public query func getAllUserTicket(user : Principal) : async [(Text, Type.Ticket)] {
    let filtered = Iter.filter<(Text, Type.Ticket)>(
      tickets.entries(),
      func((_, ticket)) {
        ticket.owner == user;
      },
    );
    return Iter.toArray(filtered);
  };

  public func createTicket(
    eventId : Text,
    owner : Principal,
    price : Nat,
    kind : Type.TicketKind,
  ) : async Type.Ticket {
    ticketIdCounter += 1;

    let paddedNum = if (ticketIdCounter < 10) {
      "00" # Nat.toText(ticketIdCounter);
    } else if (ticketIdCounter < 100) {
      "0" # Nat.toText(ticketIdCounter);
    } else {
      Nat.toText(ticketIdCounter);
    };

    let ticketId : Text = "TX-" # paddedNum;

    let tempTicket : Type.Ticket = {
      ticketID = ticketId;
      eventID = eventId;
      owner = owner;
      price = price;
      kind = kind;
      valid = true;
    };
    tickets.put(ticketId, tempTicket);

    return tempTicket;
  };

  public func transferTicket(ticket : Type.Ticket, newOwner : Principal) : async Type.Ticket {
    { ticket with owner = newOwner };
  };

};
