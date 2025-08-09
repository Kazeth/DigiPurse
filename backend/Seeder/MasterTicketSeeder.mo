import Event "canister:Event_backend";
import MasterTicket "canister:MasterTicket_backend";
import Nat "mo:base/Nat";

persistent actor {

  public func seedMockTickets() : async () {
    let events = await Event.getAllEvents();
    for (pair in events.vals()) {
      let event = pair.1;
      let priceArray = event.prices;
      let numPrices = priceArray.size();
      var eventTicketSupply : Nat = event.ticketSupply;

      var index : Nat = 0;

    

      for (price in priceArray.vals()) {
        let desc = switch (index) {
          case (0) { "Regular" };
          case (1) { "VIP" };
          case (2) { "VVIP" };
          case (_) { "General" };
        };

        let seatLabel = switch (event.kind) {
          case (#Seated _) {
            "Seat Tier " # Nat.toText(index + 1);
          };
          case (_) {
            "null";
          };
        };

        let ticketDesc = desc # " - " # seatLabel;
        let supplyPerTier = if (numPrices > 0) eventTicketSupply / numPrices else 0;
        let remainder = eventTicketSupply % numPrices;

        let supply = if (index == 0) {
          supplyPerTier + remainder;
        } else {
          supplyPerTier;
        };

        ignore await MasterTicket.createMasterTicket(
          event.id,
          ticketDesc,
          price,
          event.kind,
          supply,
        );

        index += 1;
      };
    };
  };

};
