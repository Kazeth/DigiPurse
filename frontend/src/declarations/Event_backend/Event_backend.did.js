export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const TicketKind = IDL.Variant({
    'Seated' : IDL.Record({ 'seatInfo' : IDL.Text }),
    'Seatless' : IDL.Null,
  });
  const Event = IDL.Record({
    'id' : IDL.Text,
    'organizer' : IDL.Principal,
    'valid' : IDL.Bool,
    'date' : Time,
    'kind' : TicketKind,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'ticketSupply' : IDL.Nat,
    'durationMinutes' : IDL.Nat,
    'prices' : IDL.Vec(IDL.Nat),
  });
  const EventActor = IDL.Service({
    'createEvent' : IDL.Func(
        [
          IDL.Text,
          IDL.Principal,
          IDL.Text,
          Time,
          IDL.Nat,
          IDL.Nat,
          IDL.Vec(IDL.Nat),
          TicketKind,
          IDL.Bool,
        ],
        [Event],
        [],
      ),
    'getAllEvents' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, Event))],
        ['query'],
      ),
    'getEventByEventId' : IDL.Func([IDL.Text], [IDL.Opt(Event)], ['query']),
  });
  return EventActor;
};
export const init = ({ IDL }) => { return []; };
