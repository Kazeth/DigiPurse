import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import Option "mo:base/Option";

import Types "./types";
import Event "/Event/Event";
import Ticket "/Event/Ticket";

actor Registry {

  var users : [(Principal, Types.UserProfile)] = [];
  var events : [Types.Event] = [];
  var tickets = Buffer.Buffer<(Text, Types.Ticket)>(0);
  var transactions : [Types.Transaction] = [];

  public func registerUser(principal : Principal, profile : Types.UserProfile) : async () {
    users := Array.append(users, [(principal, profile)]);
  };

  public query func getUserProfile(p : Principal) : async ?Types.UserProfile {
    for ((id, prof) in users.vals()) {
      if (id == p) return ?prof;
    };
    return null;
  };

  public func createEvent(
    organizer : Principal,
    name : Text,
    desc : Text,
    date : Time.Time,
    duration : Nat,
    supply : Nat,
  ) : async () {
    let ev = Event.createEvent(organizer, name, desc, date, duration, supply);
    events := Array.append(events, [ev]);
  };

  public query func getAllEvents() : async [Types.Event] {
    events;
  };

  public query func getAllUsers() : async [(Principal, Types.UserProfile)] {
    return users;
  };

  // public func createTicket(eventId : Text, owner : Principal, price : Nat, kind : Types.TicketKind) : async Text {
  //   let event : ?Types.Event = Array.find<Types.Event>(events, func(e) { return e.eventID == eventId });

  //   let supply = switch (event) {
  //     case (null) { throw Error.reject("Event not found") };
  //     case (?e) { e.ticketSupply };
  //   };

  //   var currentCount : Nat = 0;
  //   for ((_ticketId, ticket) in tickets.vals()) {
  //     if (ticket.eventID == eventId) {
  //       currentCount += 1;
  //     };
  //   };

  //   if (currentCount >= supply) {
  //     throw Error.reject("Ticket supply for this event has been reached");
  //   };

  //   let id : Nat = tickets.size();
  //   let ticket = Ticket.createTicket(eventId, owner, price, kind);
  //   tickets.add((id, ticket));
  //   return id;
  // };

  // public func transferTicket(ticketId : Text, newOwner : Principal) : async Bool {
  //   if (ticketId >= tickets.size()) return false;

  //   let (_, t) = tickets.get(ticketId);
  //   let updated = Ticket.transferTicket(t, newOwner);
  //   tickets.put(ticketId, (ticketId, updated));

  //   let tx : Types.Transaction = {
  //     transactionID = transactions.size();
  //     ticketID = ticketId;
  //     buyer = newOwner;
  //     seller = t.owner;
  //     method = "transfer";
  //     paymentSource = "wallet";
  //     price = t.price;
  //     timestamp = Time.now();
  //   };
  //   transactions := Array.append(transactions, [tx]);

  //   return true;
  // };

  // public query func getUserTickets(owner : Principal) : async [Ticket.Ticket] {
  //   Array.mapFilter<(Types.TicketId, Ticket.Ticket), Ticket.Ticket>(
  //     tickets.toArray(),
  //     func((id : Types.TicketId, t : Ticket.Ticket)) {
  //       if (t.owner == owner) ?t else null;
  //     },
  //   );
  // };

  // public query func getAllTickets() : async [Ticket.Ticket] {
  //   Array.map(
  //     Buffer.toArray(tickets),
  //     func((id : Types.TicketId, t : Ticket.Ticket)) : Ticket.Ticket {
  //       t;
  //     },
  //   );
  // };

  // public query func getAllTransactions() : async [Types.Transaction] {
  //   transactions;
  // };
};
