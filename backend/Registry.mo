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

     var events : [Types.Event] = [];
     var tickets = Buffer.Buffer<(Nat, Types.Ticket)>(0); // Changed from (Text, Types.Ticket)
     var transactions : [Types.Transaction] = [];

     var customers : [(Principal, Types.Customer)] = [];
     var organizers : [(Principal, Types.Organizer)] = [];
     var admins : [(Principal, Types.Admin)] = [];

     // Customer Regions
     public func registerCustomer(principal : Principal, profile : Types.Customer) : async () {
       customers := Array.append(customers, [(principal, profile)]);
     };

     public query func getCustomerProfile(p : Principal) : async ?Types.Customer {
       for ((id, prof) in customers.vals()) {
         if (id == p) return ?prof;
       };
       return null;
     };

     public query func getCustomerTickets(p : Principal) : async [Types.Ticket] {
       var res : [Types.Ticket] = [];
       for ((id, ticket) in tickets.vals()) {
         if (ticket.owner == p) {
           res := Array.append(res, [ticket]);
         };
       };
       return res;
     };

     public func checkUserExist(p : Principal) : async Bool {
       for ((id, _) in customers.vals()) {
         if (id == p) return true;
       };
       return false;
     };

     // Event Organizers
     public func registerOrganizer(principal : Principal, profile : Types.Organizer) : async () {
       organizers := Array.append(organizers, [(principal, profile)]);
     };

     public func createEvent(
       organizer : Principal,
       name : Text,
       desc : Text,
       date : Time.Time,
       duration : Nat,
       supply : Nat,
     ) : async () {
       let eventActor = await Event.EventActor();
       let ev = await eventActor.createEvent(organizer, name, desc, date, duration, supply);
       events := Array.append(events, [ev]);
     };

     public query func getAllEvents() : async [Types.Event] {
       events;
     };

     public query func getAllCustomers() : async [(Principal, Types.Customer)] {
       return customers;
     };

     public func createTicket(eventId : Text, owner : Principal, price : Nat, kind : Types.TicketKind) : async Nat {
       let ticketActor = await Ticket.TicketActor();
       let event : ?Types.Event = Array.find<Types.Event>(events, func(e) { return e.id == eventId });

       let supply = switch (event) {
         case (null) { throw Error.reject("Event not found") };
         case (?e) { e.ticketSupply };
       };

       var currentCount : Nat = 0;
       for ((_ticketId, ticket) in tickets.vals()) {
         if (ticket.eventID == eventId) {
           currentCount += 1;
         };
       };

       if (currentCount >= supply) {
         throw Error.reject("Ticket supply for this event has been reached");
       };

       let id : Nat = tickets.size();
       let ticket = await ticketActor.createTicket(eventId, id, owner, price, kind);
       tickets.add((id, ticket));
       return id;
     };

     public func transferTicket(ticketId : Nat, newOwner : Principal) : async Bool { // Changed from Text to Nat
       let ticketActor = await Ticket.TicketActor();
       let ticketOpt = Array.find<(Nat, Types.Ticket)>(Buffer.toArray(tickets), func((id, _)) { id == ticketId });
       switch (ticketOpt) {
         case (null) { return false };
         case (?(_, t)) {
           let updated = await ticketActor.transferTicket(t, newOwner);
           tickets.put(ticketId, (ticketId, updated));

           let tx : Types.Transaction = {
             id = Nat.toText(transactions.size());
             ticketID = Nat.toText(ticketId); // Convert Nat to Text for ticketID
             buyer = newOwner;
             seller = t.owner;
             method = "transfer";
             paymentSource = "wallet";
             price = t.price;
             timestamp = Time.now();
           };
           transactions := Array.append(transactions, [tx]);

           return true;
         };
       };
     };

     public query func getUserTickets(owner : Principal) : async [Types.Ticket] {
       Array.mapFilter<(Nat, Types.Ticket), Types.Ticket>(
         Buffer.toArray(tickets),
         func((_, t)) {
           if (t.owner == owner) ?t else null;
         },
       );
     };

     public query func getAllTickets() : async [Types.Ticket] {
       Array.map<(Nat, Types.Ticket), Types.Ticket>(
         Buffer.toArray(tickets),
         func((_, t)) : Types.Ticket {
           t;
         },
       );
     };

     public query func getAllTransactions() : async [Types.Transaction] {
       transactions;
     };
   };