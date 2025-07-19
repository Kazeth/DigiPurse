import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Blob "mo:base/Blob";

module {
  public type UserProfile = {
    userID : Principal;
    username : Text;
    joinDate : Time.Time;
    userAddress : Text;
    isOrganizer : Bool;
  };
  public type Event = {
    eventID: Text;
    organizer: Principal;
    eventName: Text;
    eventDescription: Text;
    eventDate: Time.Time;
    eventDurationMinutes: Nat;
    ticketSupply: Nat; // <-- FIELD BARU
  };

  public type TicketKind = {
    #Seated: { seatInfo: Text };
    #Seatless;
  };

  public type Ticket = {
    ticketID : Text;
    eventID: Text;
    owner: Principal;
    price: Nat;
    kind: TicketKind;
    isValid: Bool;
  };

  public type Transaction = {
    transactionID: Text;
    ticketID: Text;
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