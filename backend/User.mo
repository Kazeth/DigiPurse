import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import HashMap "mo:base/HashMap";
import Trie "mo:base/Trie";
import Region "mo:base/Region";

import Types "./types";
import Registry "canister:Registry_backend";

persistent actor User{
  var profile : Types.Customer = {
    id = Principal.fromText("aaaaa-aa");
    name = "";
    joinDate = Time.now();
    address = "";
  };
  transient var myTickets = HashMap.HashMap<Text, Types.Ticket>(16, Text.equal, Text.hash);
  transient var myTransactions = HashMap.HashMap<Text, Types.Transaction>(16, Text.equal, Text.hash);

  public func getMyProfile() : async ?Types.Customer {
    return await Registry.getCustomerProfile(profile.id);
  };

  public query func getMyTickets() : async [(Text, Types.Ticket)] {
    var res : [(Text, Types.Ticket)] = [];
    for ((id, ticket) in myTickets.entries()) {
      res := Array.append(res, [(id, ticket)]);
    };
    return res;
  };

  public func getMyTransactionHistory() : async [Types.Transaction] {
    var allTransactions : [Types.Transaction] = [];
    for (tx in myTransactions.vals()) {
      if (tx.buyer == profile.id or tx.seller == profile.id) {
        allTransactions := Array.append(allTransactions, [tx]);
      };
    };
    return allTransactions;
  };

  // public func updateTicketPrice(id : Text, newPrice : Nat) : async () {
  //   let ticket = switch (myTickets.get(id)) {
  //     case null { throw Error.reject("Ticket not found") };
  //     case (?t) { t };
  //   };
  //   myTickets.put(id, { ticket with price = newPrice });
  // };

  // public func removeTicketForTransfer(id : Text) : async Types.Ticket {
  //   let ticket = switch (myTickets.get(id)) {
  //     case null { throw Error.reject("Ticket not in seller's account") };
  //     case (?t) { t };
  //   };
  //   myTickets.delete(id);
  //   return ticket;
  // };

  // public func receiveTicket(id : Text, ticket : Types.Ticket) : async () {
  //   if (myTickets.get(id) != null) {
  //     throw Error.reject("Ticket already exists in buyer's account");
  //   };
  //   myTickets.put(id, ticket);
  // };

  // public func addTransaction(tx : Types.Transaction) : async () {
  //   myTransactions.put(tx.id, tx);
  // };
};
