import Type "../types";
import TrieMap "mo:base/TrieMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

actor class MasterTicketActor() {

  stable var stableMasterTickets : [(Text, Type.MasterTicket)] = [];
  private var masterTickets = TrieMap.TrieMap<Text, Type.MasterTicket>(Text.equal, Text.hash);

  system func preupgrade() {
    stableMasterTickets := Iter.toArray(masterTickets.entries());
  };

  system func postupgrade() {
    masterTickets := TrieMap.fromEntries<Text, Type.MasterTicket>(Iter.fromArray(stableMasterTickets), Text.equal, Text.hash);
  };

  public query func getAllMasterTicket() : async [(Text, Type.MasterTicket)] {
    return Iter.toArray(masterTickets.entries());
  };

  public func createMasterTicket(eventId : Text, ticketDesc : Text, price : Nat, kind : Type.TicketKind) : async Type.MasterTicket {
    let tempTicket : Type.MasterTicket = {
      eventID = eventId;
      ticketDesc = ticketDesc;
      price = price;
      kind = kind;
      valid = true;
    };

    masterTickets.put(eventId, tempTicket);
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
      valid = false;
    };
  };
};
