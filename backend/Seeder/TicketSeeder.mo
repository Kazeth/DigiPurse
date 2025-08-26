import MasterTicket "canister:MasterTicket_backend";
import Principal "mo:base/Principal";
import Ticket "canister:Ticket_backend";

persistent actor {

  public func seedMockUserTickets(owner : Principal) : async () {
    let data = await MasterTicket.getAllMasterTicket();

    var index = 1;
    let total = 5;

    label outer for (pair in data.vals()) {
      let masterTickets = pair.1;
      for (masterTicket in masterTickets.vals()) {
        let eventId = masterTicket.eventID;
        let desc = masterTicket.ticketDesc;
        let price = masterTicket.price;
        let kind = masterTicket.kind;

        ignore await Ticket.createTicket(
          eventId,
          owner,
          desc,
          price,
          kind,
        );
        index += 1;
        if (index >= total) break outer;
      };
    };
  };

  public func seedMockOnSaleTickets() : async () {
    let data = await MasterTicket.getAllMasterTicket();

    let seller = Principal.fromText("2vxsx-fae");

    // create seller's tickets
    var index = 1;
    let total = 20;

    label outer for (pair in data.vals()) {
      let masterTickets = pair.1;
      for (masterTicket in masterTickets.vals()) {
        let eventId = masterTicket.eventID;
        let desc = masterTicket.ticketDesc;
        let price = masterTicket.price;
        let kind = masterTicket.kind;

        ignore await Ticket.createTicket(
          eventId,
          seller,
          desc,
          price,
          kind,
        );
        index += 1;
        if (index >= total) break outer;
      };
    };

    // sell seller's tickets
    let data2 = await Ticket.getAllUserTicket(seller);

    for (pair in data2.vals()) {
      let tickets = pair.1;
      for (ticket in tickets.vals()) {
        let ticketId = ticket.ticketID;
        ignore await Ticket.sellTicket(ticketId, ticket.price);
      };
    };

  };
};
