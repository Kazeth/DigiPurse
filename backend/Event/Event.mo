import Time "mo:base/Time";

module {
  public type EventId = Text;
  public type Event = {
    organizer: Principal;
    eventName: Text;
    eventDescription: Text;
    eventDate: Time.Time;
    eventDurationMinutes: Nat;
  };

  public func createEvent(organizer: Principal, name: Text, desc: Text, date: Time.Time, duration: Nat): Event {
    {
      organizer = organizer;
      eventName = name;
      eventDescription = desc;
      eventDate = date;
      eventDurationMinutes = duration;
    }
  };
}
