export const idlFactory = ({ IDL }) => {
  const PassportInfo = IDL.Record({
    'dateOfExpiry' : IDL.Text,
    'dateOfBirth' : IDL.Text,
    'fullName' : IDL.Text,
    'nationality' : IDL.Text,
    'gender' : IDL.Text,
    'passportNumber' : IDL.Text,
  });
  return IDL.Service({
    'getIdentity' : IDL.Func([], [IDL.Opt(PassportInfo)], ['query']),
    'hasIdentity' : IDL.Func([], [IDL.Bool], ['query']),
    'saveIdentity' : IDL.Func([PassportInfo], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
