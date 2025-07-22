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
  const Organizer = IDL.Record({
    'id' : IDL.Principal,
    'joinDate' : Time,
    'name' : IDL.Text,
    'address' : IDL.Text,
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
    'getCustomerTickets' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Ticket)],
        ['query'],
      ),
    'registerCustomer' : IDL.Func([IDL.Principal, Customer], [], []),
    'registerOrganizer' : IDL.Func([IDL.Principal, Organizer], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
