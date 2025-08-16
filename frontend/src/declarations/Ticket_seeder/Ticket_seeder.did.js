export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'seedMockOnSaleTickets' : IDL.Func([], [], []),
    'seedMockUserTickets' : IDL.Func([IDL.Principal], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
