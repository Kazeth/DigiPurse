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
    'price' : IDL.Nat,
  });
  const TicketActor = IDL.Service({
    'createTicket' : IDL.Func(
        [IDL.Text, IDL.Principal, IDL.Nat, TicketKind],
        [Ticket],
        [],
      ),
    'getAllTicket' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, Ticket))],
        ['query'],
      ),
    'getAllUserTicket' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Text, Ticket))],
        ['query'],
      ),
    'sellTicket' : IDL.Func([IDL.Text], [IDL.Opt(Ticket)], ['query']),
    'transferTicket' : IDL.Func([Ticket, IDL.Principal], [Ticket], []),
  });
  return TicketActor;
};
export const init = ({ IDL }) => { return []; };
