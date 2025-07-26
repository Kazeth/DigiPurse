import Type "../types";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
persistent actor class MasterTicketActor() {

  var stableMasterTickets : [(Text, [Type.MasterTicket])] = [];
  private transient var masterTickets = TrieMap.TrieMap<Text, [Type.MasterTicket]>(Text.equal, Text.hash);

  system func preupgrade() {
    stableMasterTickets := Iter.toArray(masterTickets.entries());
  };

  system func postupgrade() {
    masterTickets := TrieMap.fromEntries<Text, [Type.MasterTicket]>(Iter.fromArray(stableMasterTickets), Text.equal, Text.hash);
  };

  public query func getMasterTicketsByEvent(eventId : Text) : async [Type.MasterTicket] {
    switch (masterTickets.get(eventId)) {
      case (?tickets) {
        tickets;
      };
      case (null) { [] };
    };
  };

  public query func getAllMasterTicket() : async [(Text, [Type.MasterTicket])] {
    Iter.toArray(masterTickets.entries());
  };

  public query func getMasterTicketByEventId(eventId : Text) : async ?[Type.MasterTicket] {
    var res = masterTickets.get(eventId);
    Debug.print(debug_show(res));
    return res;
  };

  public func createMasterTicket(eventId : Text, ticketDesc : Text, price : Nat, kind : Type.TicketKind, ticketSupply : Nat) : async Type.MasterTicket {
    let tempTicket : Type.MasterTicket = {
      eventID = eventId;
      ticketDesc = ticketDesc;
      price = price;
      kind = kind;
      ticketSupply = ticketSupply;
      valid = true;
    };

    switch (masterTickets.get(eventId)) {
      case (?tickets) {
        var mutableTickets = tickets;
        mutableTickets := Array.append(mutableTickets, [tempTicket]);
        masterTickets.put(eventId, mutableTickets);
      };
      case (null) {
        masterTickets.put(eventId, [tempTicket]);
      };
    };
    return tempTicket;
  };

  public func updateTicketPrice(ticket : Type.MasterTicket, price : Nat) : async Type.MasterTicket {
    { ticket with price = price };
  };

  public func emptyTicket() : async Type.MasterTicket {
    {
      eventID = "";
      ticketDesc = "";
      price = 0;
      kind = #Seatless;
      ticketSupply = 0;
      valid = false;
    };
  };
};
