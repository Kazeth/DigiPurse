import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Option "mo:base/Option";

import HashMap "mo:base/HashMap";
import StableHash "mo:base/Hash";

import Types "./types";

actor class User(ownerPrincipal : Principal, initialProfile : Types.UserProfile) {

  var owner : Principal = ownerPrincipal;
  var profile : Types.UserProfile = initialProfile;
  var myTickets = HashMap.HashMap<Types.TicketId, Types.Ticket>(16, Nat.equal, StableHash.hash);
  var myTransactions = HashMap.HashMap<Nat, Types.Transaction>(16, Nat.equal, StableHash.hash);

  query func getProfile() : async Types.UserProfile { profile };
  query func isOrganizer() : async Bool { profile.isOrganizer };

  query func getMyTickets() : async [(Types.TicketId, Types.Ticket)] {
    var res : [(Types.TicketId, Types.Ticket)] = [];
    for ((id, ticket) in myTickets.entries()) {
      res := Array.append(res, [(id, ticket)]);
    };
    return res;
  };

  query func getTransactionHistory() : async [Types.Transaction] {
    var res : [Types.Transaction] = [];
    for (tx in myTransactions.vals()) { res := Array.append(res, [tx]) };
    return res;
  };

  func addTicket(id : Types.TicketId, eventId : Types.EventId, price : Nat, kind : Types.TicketKind) : async () {
    myTickets.put(id, { eventID = eventId; price = price; kind = kind; isValid = true });
  };

  func updateTicketPrice(id : Types.TicketId, newPrice : Nat) : async () {
    let ticket = switch (myTickets.get(id)) {
      case null { throw Error.reject("Ticket not found") };
      case (?t) { t };
    };
    myTickets.put(id, { ticket with price = newPrice });
  };

  func removeTicketForTransfer(id : Types.TicketId) : async Types.Ticket {
    let ticket = switch (myTickets.get(id)) {
      case null { throw Error.reject("Ticket not in seller's account") };
      case (?t) { t };
    };
    myTickets.delete(id);
    return ticket;
  };

  func receiveTicket(id : Types.TicketId, ticket : Types.Ticket) : async () {
    if (myTickets.get(id) != null) {
      throw Error.reject("Ticket already exists in buyer's account");
    };
    myTickets.put(id, ticket);
  };

  func addTransaction(tx : Types.Transaction) : async () {
    myTransactions.put(tx.txId, tx);
  };
};