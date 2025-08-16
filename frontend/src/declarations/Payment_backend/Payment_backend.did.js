export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const PaymentManager = IDL.Service({
    'getMyBalance' : IDL.Func([IDL.Text], [IDL.Nat], []),
    'getMyPrincipal' : IDL.Func([], [IDL.Principal], ['query']),
    'sendTokens' : IDL.Func([IDL.Text, IDL.Principal, IDL.Nat], [Result_1], []),
    'topUpCanister' : IDL.Func([IDL.Principal, IDL.Nat], [Result], []),
  });
  return PaymentManager;
};
export const init = ({ IDL }) => { return []; };
