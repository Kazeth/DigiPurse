import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Hashmap "mo:base/HashMap";

import Event "/Event/Event";
import Ticket "/Event/Ticket";
import Types "types";

actor Registry {

  var events : [Types.Event] = [];
  var transactions : [Types.Transaction] = [];
  var tickets = Hashmap.HashMap<Principal, [Types.Ticket]>(0, Principal.equal, Principal.hash);

  var customers = Hashmap.HashMap<Principal, Types.Customer>(0, Principal.equal, Principal.hash);
  var organizers = Hashmap.HashMap<Principal, Types.Organizer>(0, Principal.equal, Principal.hash);
  // var admins = Hashmap.HashMap<Principal, Types.Admin>(0, Principal.equal, Principal.hash);

  // Customer Regions
  public func registerCustomer(principal : Principal, profile : Types.Customer) : async () {
    return customers.put(principal, profile);
  };

  public func updateCustomerProfile(principal : Principal, profile : Types.Customer) : async () {
    ignore customers.replace(principal, profile);
  };

  public query func getCustomerProfile(p : Principal) : async ?Types.Customer {
    return customers.get(p);
  };

  public query func getCustomerTickets(p : Principal) : async ?[Types.Ticket] {
    return tickets.get(p);
  };

  public func checkUserExist(p : Principal) : async Bool {
    Debug.print("Checking if user exists...");
    return Option.isSome(customers.get(p));
  };

  // Event Organizers
  public func registerOrganizer(principal : Principal, profile : Types.Organizer) : async () {
    organizers.put(principal, profile);
  };

  public func createEvent(
    name : Text,
    organizerId : Text,
    desc : Text,
    date : Time.Time,
    duration : Nat,
    supply : Nat,
    price : [Nat],
    kind : Types.TicketKind,
    valid : Bool,
  ) : async () {
    let eventActor = await Event.EventActor();
    let ev = await eventActor.createEvent(name, organizerId, desc, date, duration, supply, price, kind, valid);
    events := Array.append(events, [ev]);
  };

  public query func getAllEvents() : async [Types.Event] {
    events;
  };

  public query func getAllCustomers() : async [Types.Customer] {
    var res : [Types.Customer] = [];
    for (value in customers.vals()) {
      res := Array.append(res, [value]);
    };
    return res;
  };

  // public func createTicket(eventId : Text, owner : Principal, price : Nat, kind : Types.TicketKind) : async Nat {
  //   let event : ?Types.Event = Array.find<Types.Event>(events, func(e) { return e.id == eventId });

  //   let supply = switch (event) {
  //     case (null) { throw Error.reject("Event not found") };
  //     case (?e) { e.ticketSupply };
  //   };

  //   var currentCount : Nat = 0;
  //   for ((_ticketId, ticket) in tickets.entries()) {
  //     if (ticket.eventID == eventId) {
  //       currentCount += 1;
  //     };
  //   };

  //   if (currentCount >= supply) {
  //     throw Error.reject("Ticket supply for this event has been reached");
  //   };

  //   let id : Nat = tickets.size();
  //   let ticket = await ticketActor.createTicket(eventId, id, owner, price, kind);
  //   tickets.put((owner, ticket));
  //   return id;
  // };

  // public func transferTicket(ticketId : Nat, newOwner : Principal) : async Bool { // Changed from Text to Nat
  //   let ticketActor = await Ticket.TicketActor();
  //   let ticketOpt = Array.find<(Nat, Types.Ticket)>(Buffer.toArray(tickets), func((id, _)) { id == ticketId });
  //   switch (ticketOpt) {
  //     case (null) { return false };
  //     case (?(_, t)) {
  //       let updated = await ticketActor.transferTicket(t, newOwner);
  //       tickets.put(ticketId, (ticketId, updated));

  //       let tx : Types.Transaction = {
  //         id = Nat.toText(transactions.size());
  //         ticketID = Nat.toText(ticketId); // Convert Nat to Text for ticketID
  //         buyer = newOwner;
  //         seller = t.owner;
  //         method = "transfer";
  //         paymentSource = "wallet";
  //         price = t.price;
  //         timestamp = Time.now();
  //       };
  //       transactions := Array.append(transactions, [tx]);

  //       return true;
  //     };
  //   };
  // };
  public func addTransaction(tx : Types.Transaction) : async () {
    transactions := Array.append(transactions, [tx]);
  };

  public query func getAllTransactions() : async [Types.Transaction] {
    transactions;
  };
};
