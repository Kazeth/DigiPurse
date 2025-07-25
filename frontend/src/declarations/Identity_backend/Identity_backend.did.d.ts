import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Identity {
  'dob' : string,
  'dateOfExpiry' : string,
  'name' : string,
  'nationality' : string,
  'passportImageName' : string,
  'isVerified' : boolean,
  'gender' : string,
  'passportNumber' : string,
}
export interface _SERVICE {
  'clearIdentity' : ActorMethod<[Principal], undefined>,
  'getIdentity' : ActorMethod<[Principal], [] | [Identity]>,
  'saveIdentity' : ActorMethod<[Principal, Identity], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
