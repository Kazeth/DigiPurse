import Principal "mo:base/Principal";
import Type "../types";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";

persistent actor class TicketActor() {

  var ticketIdCounter : Nat = 0;

  var stableTickets : [(Text, [Type.Ticket])] = [];
  private transient var tickets = TrieMap.TrieMap<Text, [Type.Ticket]>(Text.equal, Text.hash);

  system func preupgrade() {
    stableTickets := Iter.toArray(tickets.entries());
  };

  system func postupgrade() {
    tickets := TrieMap.fromEntries<Text, [Type.Ticket]>(Iter.fromArray(stableTickets), Text.equal, Text.hash);
  };

  public query func getAllOnSaleTicket() : async [(Text, [Type.Ticket])] {
    let filtered = Iter.filter<(Text, [Type.Ticket])>(
      Iter.map<(Text, [Type.Ticket]), (Text, [Type.Ticket])>(
        tickets.entries(),
        func((eventId, ticketArr)) {
          let onSaleTickets = Iter.toArray(
            Iter.filter<Type.Ticket>(
              ticketArr.vals(),
              func(t) { t.isOnMarketplace },
            )
          );
          (eventId, onSaleTickets);
        },
      ),
      func((_, onSaleTickets)) { onSaleTickets.size() > 0 },
    );

    Iter.toArray(filtered);
  };

  public query func getAllUserTicket(user : Principal) : async [(Text, [Type.Ticket])] {
    let mapped = Iter.map<(Text, [Type.Ticket]), (Text, [Type.Ticket])>(
      tickets.entries(),
      func((eventId, ticketArr)) {
        let userTickets = Iter.toArray(
          Iter.filter<Type.Ticket>(
            ticketArr.vals(),
            func(t) { t.owner == user },
          )
        );
        (eventId, userTickets);
      },
    );
    Iter.toArray(mapped);
  };

  public func sellTicket(ticketId : Text) : async ?Type.Ticket {

    for ((eventId, ticketArr) in tickets.entries()) {
      var found = false;

      let updatedArr = Array.map<Type.Ticket, Type.Ticket>(
        ticketArr,
        func(t) {
          if (t.ticketID == ticketId) {
            found := true;
            { t with isOnMarketplace = true };
          } else {
            t;
          };
        },
      );

      if (found) {
        tickets.put(eventId, updatedArr);
        
        return Array.find<Type.Ticket>(updatedArr, func(t) { t.ticketID == ticketId });
      };
    };

    return null;
  };

  public func createTicket(
    eventId : Text,
    owner : Principal,
    ticketDesc : Text,
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
      ticketDesc = ticketDesc;
      price = price;
      kind = kind;
      valid = true;
      isOnMarketplace = false;
    };

    let existingTickets = switch (tickets.get(eventId)) {
      case (?arr) { arr };
      case (null) { [] };
    };

    let updatedTickets = Array.append(existingTickets, [tempTicket]);
    tickets.put(eventId, updatedTickets);

    return tempTicket;
  };

  public func transferTicket(ticket : Type.Ticket, newOwner : Principal) : async Type.Ticket {
    { ticket with owner = newOwner };
  };

};
