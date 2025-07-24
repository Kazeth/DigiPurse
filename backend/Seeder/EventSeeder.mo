import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Type "../types";
import Event "canister:Event_backend";

actor {

    public func seedMockEvents() : async () {
        let eventNames : [Text] = [
            "ICP Innovate Summit",
            "Decentralized Future Conf.",
            "Web3 Builders Workshop",
            "NFT Showcase 2025",
            "Global Blockchain Forum",
        ];

        let organizers : [Text] = ["OR-099", "OR-098"];
        let now = Time.now();

        let total = 10;

        for (i in Iter.range(1, total)) {
            let name = eventNames[i % eventNames.size()];
            let desc = "This is a mock event for " # name;
            let timestamp = now + (Int.abs(i % 5) * 86_400_000_000_000);
            let duration = 60 + (i * 10) % 180;
            let ticketSupply = 50 + (i * 37) % 500;
            let price = 10 + (i * 100) % 200;
            let organizerId = organizers[i % organizers.size()];

            let kind : Type.TicketKind = if (i % 2 == 0) {
                #Seated({
                    seatInfo = "Section A Row " # Nat.toText((i % 10) + 1);
                });
            } else {
                #Seatless;
            };

            let prices = [
                price,
                price + 20,
                price + 30
            ];

            ignore await Event.createEvent(
                name,
                organizerId,
                desc,
                timestamp,
                duration,
                ticketSupply,
                prices,
                kind,
                true,
            );

        };
    };
};
