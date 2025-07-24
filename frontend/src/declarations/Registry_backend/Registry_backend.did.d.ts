import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Customer {
  'id' : Principal,
  'joinDate' : Time,
  'name' : string,
  'address' : string,
}
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
export interface Organizer {
  'id' : Principal,
  'joinDate' : Time,
  'name' : string,
  'address' : string,
}
export interface Ticket {
  'id' : bigint,
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
export interface _SERVICE {
  'addTransaction' : ActorMethod<[Transaction], undefined>,
  'checkUserExist' : ActorMethod<[Principal], boolean>,
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
    undefined
  >,
  'getAllCustomers' : ActorMethod<[], Array<Customer>>,
  'getAllEvents' : ActorMethod<[], Array<Event>>,
  'getAllTransactions' : ActorMethod<[], Array<Transaction>>,
  'getCustomerProfile' : ActorMethod<[Principal], [] | [Customer]>,
  'getCustomerTickets' : ActorMethod<[Principal], [] | [Array<Ticket>]>,
  'registerCustomer' : ActorMethod<[Principal, Customer], undefined>,
  'registerOrganizer' : ActorMethod<[Principal, Organizer], undefined>,
  'updateCustomerProfile' : ActorMethod<[Principal, Customer], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
