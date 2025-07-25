export const idlFactory = ({ IDL }) => {
  const Identity = IDL.Record({
    'dob' : IDL.Text,
    'dateOfExpiry' : IDL.Text,
    'name' : IDL.Text,
    'nationality' : IDL.Text,
    'passportImageName' : IDL.Text,
    'isVerified' : IDL.Bool,
    'gender' : IDL.Text,
    'passportNumber' : IDL.Text,
  });
  return IDL.Service({
    'clearIdentity' : IDL.Func([IDL.Principal], [], []),
    'getIdentity' : IDL.Func([IDL.Principal], [IDL.Opt(Identity)], ['query']),
    'saveIdentity' : IDL.Func([IDL.Principal, Identity], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
