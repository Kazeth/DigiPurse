import Event "canister:Event_backend";
import MasterTicket "canister:MasterTicket_backend";
import Type "../types";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Iter "mo:base/Iter";

persistent actor {

  public func seedMockTickets() : async () {
    let events = await Event.getAllEvents();
    for (pair in events.vals()) {
      let event = pair.1;
      let priceArray = event.prices;
      var index : Nat = 0;

      for (price in priceArray.vals()) {
        let desc = if (index == 0) {
          "Regular";
        } else if (index == 1) {
          "VIP";
        } else if (index == 2) {
          "VVIP";
        } else {
          "General";
        };

        for (i in Iter.range(1, 3)) {
          let seatLabel = switch (event.kind) {
            case (#Seated _) {
              "Seat " # Nat.toText(i);
            };
            case (_) {
              "null";
            };
          };

          let ticketDesc = desc # " - " # seatLabel;

          ignore await MasterTicket.createMasterTicket(
            event.id,
            ticketDesc,
            price,
            event.kind,
          );
        };

        index += 1;
      };
    };
  };

};
