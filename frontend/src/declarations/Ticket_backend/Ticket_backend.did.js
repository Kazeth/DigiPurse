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
    'ticketID' : IDL.Text,
    'price' : IDL.Nat,
  });
  const TicketActor = IDL.Service({
    'createTicket' : IDL.Func(
        [IDL.Text, IDL.Principal, IDL.Nat, TicketKind],
        [Ticket],
        [],
      ),
    'getAllUserTicket' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Text, Ticket))],
        ['query'],
      ),
    'transferTicket' : IDL.Func([Ticket, IDL.Principal], [Ticket], []),
  });
  return TicketActor;
};
export const init = ({ IDL }) => { return []; };
