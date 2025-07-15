import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Blob "mo:base/Blob";

module {
  public type UserProfile = {
    username : Text;
    joinDate : Time.Time;
    userAddress : Text;
    isOrganizer : Bool;
  };

  public type EventId = Text;
  public type Event = {
    id: EventId;
    organizer: Principal;
    eventName: Text;
    eventDescription: Text;
    eventDate: Time.Time;
    eventDurationMinutes: Nat;
    ticketSupply: Nat; // <-- FIELD BARU
  };

  public type TicketId = Nat;
  public type TicketKind = {
    #Seated: { seatInfo: Text };
    #Seatless;
  };
  public type Ticket = {
    eventID: EventId;
    price: Nat;
    kind: TicketKind;
    isValid: Bool;
  };

  public type Transaction = {
    txId: Nat;
    ticketId: TicketId;
    buyer: Principal;
    seller: Principal;
    method: Text;
    paymentSource: Text;
    price: Nat;
    timestamp: Time.Time;
  };

  public type FileChunk = {
    chunk : Blob;
    index : Nat;
  };
  public type File = {
    name : Text;
    chunks : [FileChunk];
    totalSize : Nat;
    fileType : Text;
  };
};