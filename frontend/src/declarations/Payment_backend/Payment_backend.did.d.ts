import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface PaymentManager {
  'getMyBalance' : ActorMethod<[string], bigint>,
  'getMyPrincipal' : ActorMethod<[], Principal>,
  'sendTokens' : ActorMethod<[string, Principal, bigint], Result_1>,
  'topUpCanister' : ActorMethod<[Principal, bigint], Result>,
}
export type Result = { 'ok' : string } |
  { 'err' : string };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : string };
export interface _SERVICE extends PaymentManager {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
