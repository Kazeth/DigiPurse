export const idlFactory = ({ IDL }) => {
  const TicketKind = IDL.Variant({
    'Seated' : IDL.Record({ 'seatInfo' : IDL.Text }),
    'Seatless' : IDL.Null,
  });
  const MasterTicket = IDL.Record({
    'eventID' : IDL.Text,
    'valid' : IDL.Bool,
    'kind' : TicketKind,
    'ticketDesc' : IDL.Text,
    'price' : IDL.Nat,
  });
  const MasterTicketActor = IDL.Service({
    'createMasterTicket' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, TicketKind],
        [MasterTicket],
        [],
      ),
    'emptyTicket' : IDL.Func([], [MasterTicket], []),
    'getAllMasterTicket' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(MasterTicket)))],
        ['query'],
      ),
    'getMasterTicketByEventId' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Vec(MasterTicket))],
        ['query'],
      ),
    'updateTicketPrice' : IDL.Func([MasterTicket, IDL.Nat], [MasterTicket], []),
  });
  return MasterTicketActor;
};
export const init = ({ IDL }) => { return []; };
