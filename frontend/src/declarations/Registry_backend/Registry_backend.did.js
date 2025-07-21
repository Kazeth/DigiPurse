export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Customer = IDL.Record({
    'id' : IDL.Principal,
    'joinDate' : Time,
    'name' : IDL.Text,
    'address' : IDL.Text,
  });
  const Event = IDL.Record({
    'id' : IDL.Text,
    'organizer' : IDL.Principal,
    'date' : Time,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'ticketSupply' : IDL.Nat,
    'durationMinutes' : IDL.Nat,
  });
  return IDL.Service({
    'createEvent' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Text, Time, IDL.Nat, IDL.Nat],
        [],
        [],
      ),
    'getAllCustomers' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, Customer))],
        ['query'],
      ),
    'getAllEvents' : IDL.Func([], [IDL.Vec(Event)], ['query']),
    'getCustomerProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(Customer)],
        ['query'],
      ),
    'registerCustomer' : IDL.Func([IDL.Principal, Customer], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
