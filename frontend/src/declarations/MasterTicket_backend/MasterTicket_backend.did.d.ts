import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface MasterTicket {
  'eventID' : string,
  'valid' : boolean,
  'kind' : TicketKind,
  'ticketSupply' : bigint,
  'ticketDesc' : string,
  'price' : bigint,
}
export interface MasterTicketActor {
  'createMasterTicket' : ActorMethod<
    [string, string, bigint, TicketKind, bigint],
    MasterTicket
  >,
  'emptyTicket' : ActorMethod<[], MasterTicket>,
  'getAllMasterTicket' : ActorMethod<[], Array<[string, Array<MasterTicket>]>>,
  'getMasterTicketByEventId' : ActorMethod<
    [string],
    [] | [Array<MasterTicket>]
  >,
  'getMasterTicketsByEvent' : ActorMethod<[string], Array<MasterTicket>>,
  'updateTicketPrice' : ActorMethod<[MasterTicket, bigint], MasterTicket>,
}
export type TicketKind = { 'Seated' : { 'seatInfo' : string } } |
  { 'Seatless' : null };
export interface _SERVICE extends MasterTicketActor {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
