export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Customer = IDL.Record({
    'id' : IDL.Principal,
    'joinDate' : Time,
    'name' : IDL.Text,
    'address' : IDL.Text,
  });
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
  const Transaction = IDL.Record({
    'id' : IDL.Text,
    'method' : IDL.Text,
    'paymentSource' : IDL.Text,
    'seller' : IDL.Principal,
    'ticketID' : IDL.Text,
    'timestamp' : Time,
    'buyer' : IDL.Principal,
    'price' : IDL.Nat,
  });
  return IDL.Service({
    'getMyProfile' : IDL.Func([], [IDL.Opt(Customer)], []),
    'getMyTickets' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, Ticket))],
        ['query'],
      ),
    'getMyTransactionHistory' : IDL.Func([], [IDL.Vec(Transaction)], []),
  });
};
export const init = ({ IDL }) => { return []; };
