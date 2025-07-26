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
    'eventID' : IDL.Text,
    'valid' : IDL.Bool,
    'owner' : IDL.Principal,
    'kind' : TicketKind,
    'ticketID' : IDL.Text,
    'price' : IDL.Nat,
  });
  const Organizer = IDL.Record({
    'id' : IDL.Principal,
    'joinDate' : Time,
    'name' : IDL.Text,
    'address' : IDL.Text,
  });
  return IDL.Service({
    'addTransaction' : IDL.Func([Transaction], [], []),
    'checkUserExist' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'getAllCustomers' : IDL.Func([], [IDL.Vec(Customer)], ['query']),
    'getAllTransactions' : IDL.Func([], [IDL.Vec(Transaction)], ['query']),
    'getCustomerProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(Customer)],
        ['query'],
      ),
    'getCustomerTickets' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Vec(Ticket))],
        ['query'],
      ),
    'registerCustomer' : IDL.Func([IDL.Principal, Customer], [], []),
    'registerOrganizer' : IDL.Func([IDL.Principal, Organizer], [], []),
    'updateCustomerProfile' : IDL.Func([IDL.Principal, Customer], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
