import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Ticket {
  'eventID' : string,
  'valid' : boolean,
  'owner' : Principal,
  'kind' : TicketKind,
  'isOnMarketplace' : boolean,
  'ticketID' : string,
  'ticketDesc' : string,
  'price' : bigint,
}
export interface TicketActor {
  'createTicket' : ActorMethod<
    [string, Principal, string, bigint, TicketKind],
    Ticket
  >,
  'getAllOnSaleTicket' : ActorMethod<[], Array<[string, Array<Ticket>]>>,
  'getAllUserTicket' : ActorMethod<[Principal], Array<[string, Array<Ticket>]>>,
  'sellTicket' : ActorMethod<[string, bigint], [] | [Ticket]>,
  'transferTicket' : ActorMethod<[Ticket, Principal], [] | [Ticket]>,
}
export type TicketKind = { 'Seated' : { 'seatInfo' : string } } |
  { 'Seatless' : null };
export interface _SERVICE extends TicketActor {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
