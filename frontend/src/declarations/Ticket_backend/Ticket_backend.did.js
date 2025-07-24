export const idlFactory = ({ IDL }) => {
  const TicketKind = IDL.Variant({
    'Seated' : IDL.Record({ 'seatInfo' : IDL.Text }),
    'Seatless' : IDL.Null,
  });
  const Ticket = IDL.Record({
    'id' : IDL.Nat,
    'eventID' : IDL.Text,
    'valid' : IDL.Bool,
    'owner' : IDL.Principal,
    'kind' : TicketKind,
    'price' : IDL.Nat,
  });
  const TicketActor = IDL.Service({
    'createTicket' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Principal, IDL.Nat, TicketKind],
        [Ticket],
        [],
      ),
    'emptyTicket' : IDL.Func([], [Ticket], []),
    'transferTicket' : IDL.Func([Ticket, IDL.Principal], [Ticket], []),
    'updateTicketPrice' : IDL.Func([Ticket, IDL.Nat], [Ticket], []),
  });
  return TicketActor;
};
export const init = ({ IDL }) => { return []; };
