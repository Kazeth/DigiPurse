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
    'isOnMarketplace' : IDL.Bool,
    'ticketID' : IDL.Text,
    'ticketDesc' : IDL.Text,
    'price' : IDL.Nat,
  });
  const ActivityType = IDL.Variant({
    'AccountCreated' : IDL.Null,
    'IdentityVerified' : IDL.Null,
    'TicketPurchased' : IDL.Null,
    'TicketSold' : IDL.Null,
  });
  const ActivityLog = IDL.Record({
    'principal' : IDL.Principal,
    'activityType' : ActivityType,
    'description' : IDL.Text,
    'timestamp' : Time,
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
    'getUserActivity' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(ActivityLog)],
        ['query'],
      ),
    'recordActivity' : IDL.Func(
        [IDL.Principal, ActivityType, IDL.Text],
        [],
        [],
      ),
    'registerCustomer' : IDL.Func([IDL.Principal, Customer], [], []),
    'updateCustomerProfile' : IDL.Func([IDL.Principal, Customer], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
