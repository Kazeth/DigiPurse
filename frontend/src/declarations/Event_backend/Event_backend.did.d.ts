import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Event {
  'id' : string,
  'valid' : boolean,
  'date' : Time,
  'kind' : TicketKind,
  'name' : string,
  'description' : string,
  'organizerId' : string,
  'ticketSupply' : bigint,
  'durationMinutes' : bigint,
  'prices' : Array<bigint>,
}
export interface EventActor {
  'createEvent' : ActorMethod<
    [
      string,
      string,
      string,
      Time,
      bigint,
      bigint,
      Array<bigint>,
      TicketKind,
      boolean,
    ],
    Event
  >,
  'getAllEvents' : ActorMethod<[], Array<[string, Event]>>,
}
export type TicketKind = { 'Seated' : { 'seatInfo' : string } } |
  { 'Seatless' : null };
export type Time = bigint;
export interface _SERVICE extends EventActor {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
