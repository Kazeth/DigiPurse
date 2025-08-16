import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Blob "mo:base/Blob";

module {
  public type Customer = {
    id : Principal;
    name : Text;
    joinDate : Time.Time;
    address : Text;
  };

  public type Admin = {
    id : Principal;
    name : Text;
  };

  public type Event = {
    id : Text;
    organizer : Principal;
    name : Text;
    description : Text;
    date : Time.Time;
    durationMinutes : Nat;
    ticketSupply : Nat; // <-- FIELD BARU
    prices : [Nat];
    kind : TicketKind;
    valid : Bool;
  };

  public type TicketKind = {
    #Seated : { seatInfo : Text };
    #Seatless;
  };

  public type Ticket = {
    ticketID : Text;
    eventID : Text;
    owner : Principal;
    ticketDesc: Text;
    price : Nat;
    kind : TicketKind;
    valid : Bool;
    isOnMarketplace : Bool;
  };

  public type MasterTicket = {
    eventID : Text;
    ticketDesc : Text;
    price : Nat;
    kind : TicketKind;
    ticketSupply : Nat;
    valid : Bool;
  };

  public type Transaction = {
    id : Text;
    ticketID : Text;
    buyer : Principal;
    seller : Principal;
    method : Text;
    paymentSource : Text;
    price : Nat;
    timestamp : Time.Time;
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
  public type Identity = {
    name: Text;
    gender: Text;
    dob: Text;
    nationality: Text;
    passportNumber: Text;
    dateOfExpiry: Text;
    passportImageName: Text;
    isVerified: Bool;
  };
  public type ActivityType = {
    #AccountCreated;
    #IdentityVerified;
    #TicketPurchased;
    #TicketSold;
  };

  public type ActivityLog = {
    principal: Principal;
    timestamp: Time.Time;
    activityType: ActivityType;
    description: Text;
  };
};
