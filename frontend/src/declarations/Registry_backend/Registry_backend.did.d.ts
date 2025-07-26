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
  'eventID' : string,
  'valid' : boolean,
  'owner' : Principal,
  'kind' : TicketKind,
  'isOnMarketplace' : boolean,
  'ticketID' : string,
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
export interface _SERVICE {
  'addTransaction' : ActorMethod<[Transaction], undefined>,
  'checkUserExist' : ActorMethod<[Principal], boolean>,
  'getAllCustomers' : ActorMethod<[], Array<Customer>>,
  'getAllTransactions' : ActorMethod<[], Array<Transaction>>,
  'getCustomerProfile' : ActorMethod<[Principal], [] | [Customer]>,
  'getCustomerTickets' : ActorMethod<[Principal], [] | [Array<Ticket>]>,
  'registerCustomer' : ActorMethod<[Principal, Customer], undefined>,
  'updateCustomerProfile' : ActorMethod<[Principal, Customer], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
