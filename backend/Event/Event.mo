import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Principal "mo:base/Principal";
import Type "../types";

actor class EventActor() {
  public func createEvent(
    organizer : Principal,
    name : Text,
    desc : Text,
    date : Time.Time,
    duration : Nat,
    supply : Nat
  ) : async Type.Event {
    let timestamp : Int = Time.now();
    let positiveTimestamp : Nat = Int.abs(timestamp);
    let id : Text = Nat.toText(positiveTimestamp);
    {
      id = id;
      organizer = organizer;
      name = name;
      description = desc;
      date = date;
      durationMinutes = duration;
      ticketSupply = supply;
    };
  };
};