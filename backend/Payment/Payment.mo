import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";

import UserModule "../User/User";
import EventModule "../Event/Event";
import TicketModule "../Event/Ticket";
import TransactionModule "../Payment/Transaction";

actor Payment {
  type User = UserModule.User;
  type Event = EventModule.Event;
  type Ticket = TicketModule.Ticket;
  type Transaction = TransactionModule.Transaction;
  type TicketId = TicketModule.TicketId;
  type EventId = EventModule.EventId;
  type UserId = Principal;
  type TicketKind = TicketModule.TicketKind;

  private var users = HashMap.HashMap<UserId, User>(32, Principal.equal, Principal.hash);
  private var events : [(EventId, Event)] = [];
  private var tickets : [(TicketId, Ticket)] = [];
  private var transactions : [Transaction] = [];
  private var nextTicketId : TicketId = 0;
  private var nextTxId : Nat = 0;

  private func getEvent(id : EventId) : ?Event {
    for ((eid, e) in events.vals()) if (id == eid) return ?e;
    null;
  };

  private func getTicket(id : TicketId) : ?Ticket {
    for ((tid, t) in tickets.vals()) if (id == tid) return ?t;
    null;
  };

  public shared (msg) func register(username : Text, address : Text, isOrganizer : Bool) : async () {
    let caller = msg.caller;
    if (users.get(caller) != null) {
      throw Error.reject("User with this principal is already registered.");
    };
    let newUser = UserModule.createUser(username, address, isOrganizer);
    users.put(caller, newUser);
  };

  public shared (msg) func addEvent(id : EventId, name : Text, desc : Text, date : Time.Time, duration : Nat) : async () {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case null { throw Error.reject("User is not registered.") };
      case (?user) {
        if (not user.isOrganizer) {
          throw Error.reject("User is not an organizer.");
        };
      };
    };

    if (getEvent(id) != null) {
      throw Error.reject("Event ID already exists.");
    };

    events := Array.append(events, [(id, EventModule.createEvent(caller, name, desc, date, duration))]);
  };

  public shared (msg) func generateTicketsForEvent(eventId : EventId, price : Nat, kind : TicketKind, count : Nat) : async () {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case null { throw Error.reject("User not registered.") };
      case (?user) {
        if (not user.isOrganizer) throw Error.reject("Only organizers can generate tickets.");

        for (i in Iter.range(0, count - 1)) {
          let ticketId = nextTicketId;
          let ticket = TicketModule.createTicket(eventId, caller, price, kind);
          tickets := Array.append(tickets, [(ticketId, ticket)]);
          nextTicketId += 1;

          let updatedUser = UserModule.addTicketToUser(user, ticketId);
          users.put(caller, updatedUser);
        };
      };
    };
  };

  public shared (msg) func setTicketForSale(ticketId : TicketId, price : Nat) : async () {
    let caller = msg.caller;
    let found = Array.find<(TicketId, Ticket)>(
      tickets,
      func((id, t)) { id == ticketId },
    );

    switch (found) {
      case null { throw Error.reject("Ticket not found") };
      case (?(_, t)) {
        if (t.owner != caller) {
          throw Error.reject("This is not your ticket to sell.");
        };
      };
    };

    tickets := Array.map<(TicketId, Ticket), (TicketId, Ticket)>(
      tickets,
      func((id, t)) {
        if (id == ticketId) {
          (id, TicketModule.updateTicketPrice(t, price));
        } else {
          (id, t);
        };
      },
    );
  };

  public shared (msg) func buyTicket(ticketId : TicketId, method : Text, source : Text) : async () {
    let buyerId = msg.caller;

    // Mendapatkan profil pembeli dan penjual dari state lokal
    let buyerProfile = switch (users.get(buyerId)) {
      case null { throw Error.reject("Buyer is not registered.") };
      case (?user) { user };
    };

    var ticket : ?Ticket = null;
    for ((id, t) in tickets.vals()) {
      if (id == ticketId and t.owner != buyerId and t.isValid) {
        ticket := ?t;
      };
    };

    switch (ticket) {
      case null {
        throw Error.reject("Ticket not found or not available for purchase.");
      };
      case (?t) {
        let sellerId = t.owner;
        let sellerProfile = switch (users.get(sellerId)) {
          case null { throw Error.reject("Seller not found.") };
          case (?user) { user };
        };

        let updatedTicket = TicketModule.transferTicket(t, buyerId);
        tickets := Array.map<(TicketId, Ticket), (TicketId, Ticket)>(
          tickets,
          func((id, tk)) {
            if (id == ticketId) (ticketId, updatedTicket) else (id, tk);
          },
        );

        // Update profil pembeli dan penjual di state 'users'
        let updatedSeller = UserModule.removeTicketFromUser(sellerProfile, ticketId);
        users.put(sellerId, updatedSeller);

        let updatedBuyer = UserModule.addTicketToUser(buyerProfile, ticketId);
        users.put(buyerId, updatedBuyer);

        // Buat dan catat transaksi
        let tx = TransactionModule.createTransaction(nextTxId, ticketId, buyerId, sellerId, method, source, t.price);
        nextTxId += 1;
        transactions := Array.append(transactions, [tx]);
      };
    };
  };

  public query func getTicketDetails(id : TicketId) : async ?Ticket {
    getTicket(id);
  };

  public query func getMyTickets(msg : { caller : Principal }) : async [Ticket] {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case null return [];
      case (?user) {
        return Array.map<Nat, Ticket>(
          user.ticketIDs,
          func(id : Nat) : Ticket {
            switch (getTicket(id)) {
              case (?t) t;
              case null TicketModule.emptyTicket();
            };
          },
        );
      };
    };
  };

  public query func getTransactionHistory(user : Principal) : async [Transaction] {
    Array.filter<Transaction>(transactions, func(tx) { tx.buyer == user or tx.seller == user });
  };
};
