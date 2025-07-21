export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
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
    'id' : IDL.Text,
    'eventID' : IDL.Text,
    'valid' : IDL.Bool,
    'owner' : IDL.Principal,
    'kind' : TicketKind,
    'price' : IDL.Nat,
  });
  const User = IDL.Service({
    'addTransaction' : IDL.Func([Transaction], [], []),
    'getMyProfile' : IDL.Func([], [IDL.Opt(Customer)], []),
    'getMyTickets' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, Ticket))],
        ['query'],
      ),
    'getTransactionHistory' : IDL.Func([], [IDL.Vec(Transaction)], []),
    'receiveTicket' : IDL.Func([IDL.Text, Ticket], [], []),
    'removeTicketForTransfer' : IDL.Func([IDL.Text], [Ticket], []),
    'updateTicketPrice' : IDL.Func([IDL.Text, IDL.Nat], [], []),
    'uploadProfile' : IDL.Func([Customer], [], []),
  });
  return User;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
