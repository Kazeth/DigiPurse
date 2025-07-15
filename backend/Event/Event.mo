import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Principal "mo:base/Principal";
import Type "../types";

module {
  public func createEvent(
    organizer : Principal,
    name : Text,
    desc : Text,
    date : Time.Time,
    duration : Nat,
    supply : Nat // <-- PARAMETER BARU
  ) : Type.Event {
    let timestamp : Int = Time.now();
    let positiveTimestamp : Nat = Int.abs(timestamp);
    let id : Text = Nat.toText(positiveTimestamp);
    {
      id = id;
      organizer = organizer;
      eventName = name;
      eventDescription = desc;
      eventDate = date;
      eventDurationMinutes = duration;
      ticketSupply = supply;
    };
  };
};