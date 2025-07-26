import Event "canister:Event_backend";
import MasterTicket "canister:MasterTicket_backend";
import Type "../types";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Ticket "canister:Ticket_backend";

persistent actor {

    public func seedMockUserTickets(owner : Principal) : async () {
        let masterTickets = await MasterTicket.getAllMasterTicket();

        var index = 0;
        for (pair in masterTickets.vals()) {
            let masterTicketList = pair.1; 

            for (master in masterTicketList.vals()) {
                if (index >= 5) {
                    break;
                };

                ignore await Ticket.createTicket(
                    master.eventID,
                    owner,
                    master.ticketDesc,
                    master.price,
                    master.kind,
                );

                index += 1;
            };

            if (index >= 5) {
                break;
            };
        };
    };

    public func seedMockOnSaleTickets() : async () {
        let masterTickets = await MasterTicket.getAllMasterTicket();

        var index = 0;
        for (pair in masterTickets.vals()) {
            let masterTicketList = pair.1;

            for (master in masterTicketList.vals()) {
                if (index >= 3) {
                    break;
                };

                let ticketOpt = await Ticket.createTicket(
                    master.eventID,
                    Principal.fromText("2vxsx-fae"), 
                    master.ticketDesc,
                    master.price,
                    master.kind,
                );

                switch (ticketOpt) {
                    case (?ticket) {
                        ignore await Ticket.sellTicket(ticket.ticketID);
                        index += 1;
                    };
                    case (_) {};
                };
            };

            if (index >= 3) {
                break;
            };
        };
    };

    public func seedAllTickets(owner : Principal) : async () {
        await seedMockUserTickets(owner);
        await seedMockOnSaleTickets();
    };
};
