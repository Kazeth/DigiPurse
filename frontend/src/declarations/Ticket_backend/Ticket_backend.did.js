export const idlFactory = ({ IDL }) => {
  const TicketKind = IDL.Variant({
    'Seated' : IDL.Record({ 'seatInfo' : IDL.Text }),
    'Seatless' : IDL.Null,
  });
  const Ticket = IDL.Record({
    'eventID' : IDL.Text,
    'valid' : IDL.Bool,
    'owner' : IDL.Principal,
    'kind' : TicketKind,
    'isOnMarketplace' : IDL.Bool,
    'ticketID' : IDL.Text,
    'ticketDesc' : IDL.Text,
    'price' : IDL.Nat,
  });
  const TicketActor = IDL.Service({
    'createTicket' : IDL.Func(
        [IDL.Text, IDL.Principal, IDL.Text, IDL.Nat, TicketKind],
        [Ticket],
        [],
      ),
    'getAllOnSaleTicket' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(Ticket)))],
        ['query'],
      ),
    'getAllUserTicket' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(Ticket)))],
        ['query'],
      ),
    'sellTicket' : IDL.Func([IDL.Text], [IDL.Opt(Ticket)], []),
    'transferTicket' : IDL.Func([Ticket, IDL.Principal], [IDL.Opt(Ticket)], []),
  });
  return TicketActor;
};
export const init = ({ IDL }) => { return []; };
