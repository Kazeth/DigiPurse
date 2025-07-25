import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Event {
  'id' : string,
  'organizer' : Principal,
  'date' : Time,
  'name' : string,
  'description' : string,
  'ticketSupply' : bigint,
  'durationMinutes' : bigint,
}
export interface EventActor {
  'createEvent' : ActorMethod<
    [Principal, string, string, Time, bigint, bigint],
    Event
  >,
}
export type Time = bigint;
export interface _SERVICE extends EventActor {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
