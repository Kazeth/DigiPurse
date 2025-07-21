import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Customer {
  'id' : Principal,
  'joinDate' : Time,
  'name' : string,
  'address' : string,
}
export interface Ticket {
  'id' : string,
  'eventID' : string,
  'valid' : boolean,
  'owner' : Principal,
  'kind' : TicketKind,
  'price' : bigint,
}
export type TicketKind = { 'Seated' : { 'seatInfo' : string } } |
  { 'Seatless' : null };
export type Time = bigint;
export interface Transaction {
  'id' : string,
  'method' : string,
  'paymentSource' : string,
  'seller' : Principal,
  'ticketID' : string,
  'timestamp' : Time,
  'buyer' : Principal,
  'price' : bigint,
}
export interface User {
  'addTransaction' : ActorMethod<[Transaction], undefined>,
  'getMyProfile' : ActorMethod<[], [] | [Customer]>,
  'getMyTickets' : ActorMethod<[], Array<[string, Ticket]>>,
  'getTransactionHistory' : ActorMethod<[], Array<Transaction>>,
  'receiveTicket' : ActorMethod<[string, Ticket], undefined>,
  'removeTicketForTransfer' : ActorMethod<[string], Ticket>,
  'updateTicketPrice' : ActorMethod<[string, bigint], undefined>,
  'uploadProfile' : ActorMethod<[Customer], undefined>,
}
export interface _SERVICE extends User {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
