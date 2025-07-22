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
  'organizer' : Principal,
  'date' : Time,
  'name' : string,
  'description' : string,
  'ticketSupply' : bigint,
  'durationMinutes' : bigint,
}
export interface Organizer {
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
export interface _SERVICE {
  'createEvent' : ActorMethod<
    [Principal, string, string, Time, bigint, bigint],
    undefined
  >,
  'getAllCustomers' : ActorMethod<[], Array<[Principal, Customer]>>,
  'getAllEvents' : ActorMethod<[], Array<Event>>,
  'getCustomerProfile' : ActorMethod<[Principal], [] | [Customer]>,
  'getCustomerTickets' : ActorMethod<[Principal], Array<Ticket>>,
  'registerCustomer' : ActorMethod<[Principal, Customer], undefined>,
  'registerOrganizer' : ActorMethod<[Principal, Organizer], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
