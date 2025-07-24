export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Event = IDL.Record({
    'id' : IDL.Text,
    'organizer' : IDL.Principal,
    'date' : Time,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'ticketSupply' : IDL.Nat,
    'durationMinutes' : IDL.Nat,
  });
  const EventActor = IDL.Service({
    'createEvent' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Text, Time, IDL.Nat, IDL.Nat],
        [Event],
        [],
      ),
  });
  return EventActor;
};
export const init = ({ IDL }) => { return []; };
