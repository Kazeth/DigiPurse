import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Ticket {
  'id' : bigint,
  'eventID' : string,
  'valid' : boolean,
  'owner' : Principal,
  'kind' : TicketKind,
  'price' : bigint,
}
export interface TicketActor {
  'createTicket' : ActorMethod<
    [string, bigint, Principal, bigint, TicketKind],
    Ticket
  >,
  'emptyTicket' : ActorMethod<[], Ticket>,
  'transferTicket' : ActorMethod<[Ticket, Principal], Ticket>,
  'updateTicketPrice' : ActorMethod<[Ticket, bigint], Ticket>,
}
export type TicketKind = { 'Seated' : { 'seatInfo' : string } } |
  { 'Seatless' : null };
export interface _SERVICE extends TicketActor {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
