import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Ticket {
  'eventID' : string,
  'valid' : boolean,
  'owner' : Principal,
  'kind' : TicketKind,
  'ticketID' : string,
  'price' : bigint,
}
export interface TicketActor {
  'createTicket' : ActorMethod<[string, Principal, bigint, TicketKind], Ticket>,
  'getAllUserTicket' : ActorMethod<[Principal], Array<[string, Ticket]>>,
  'transferTicket' : ActorMethod<[Ticket, Principal], Ticket>,
}
export type TicketKind = { 'Seated' : { 'seatInfo' : string } } |
  { 'Seatless' : null };
export interface _SERVICE extends TicketActor {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
