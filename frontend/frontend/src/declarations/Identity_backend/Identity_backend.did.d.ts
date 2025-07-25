import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface PassportInfo {
  'dateOfExpiry' : string,
  'dateOfBirth' : string,
  'fullName' : string,
  'nationality' : string,
  'gender' : string,
  'passportNumber' : string,
}
export interface _SERVICE {
  'getIdentity' : ActorMethod<[], [] | [PassportInfo]>,
  'hasIdentity' : ActorMethod<[], boolean>,
  'saveIdentity' : ActorMethod<[PassportInfo], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
