import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PlusCircle, Ticket, Armchair, Users, Loader2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { createActor as createEventActor, canisterId as eventCanisterId } from '@/declarations/Event_backend';
import { createActor as createMasterTicketActor, canisterId as masterTicketCanisterId } from '@/declarations/MasterTicket_backend';
import { useAuth } from '@/lib/AuthContext';
import { Principal } from '@dfinity/principal';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { authClient, isLoggedIn } = useAuth();
  const [principal, setPrincipal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdEventId, setCreatedEventId] = useState('');

  // State for Event Details
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');

  // State for multiple Ticket Tiers (MasterTickets)
  const [ticketTiers, setTicketTiers] = useState([
    { desc: 'General Admission', price: '', supply: '', kind: { Seatless: null } },
  ]);

  // Fetch Principal on mount
  useEffect(() => {
    async function fetchPrincipal() {
      if (!authClient || !isLoggedIn) {
        setError('You must be logged in to create an event.');
        setIsLoading(false);
        return;
      }
      try {
        const identity = authClient.getIdentity();
        const userPrincipal = identity.getPrincipal();
        setPrincipal(userPrincipal);
        console.log('Principal fetched:', userPrincipal.toText());
      } catch (err) {
        console.error('Error fetching principal:', err);
        setError('Failed to authenticate. Please try logging in again.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrincipal();
  }, [authClient, isLoggedIn]);

  // Handle ticket tier field changes
  const handleTierChange = (index, field, value) => {
    const newTiers = [...ticketTiers];
    newTiers[index][field] = value;
    setTicketTiers(newTiers);
  };

  // Add a new ticket tier
  const addTier = () => {
    setTicketTiers([...ticketTiers, { desc: '', price: '', supply: '', kind: { Seatless: null } }]);
  };

  // Remove a ticket tier
  const removeTier = (index) => {
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

  // Calculate total ticket supply
  const totalTicketSupply = ticketTiers.reduce((sum, tier) => sum + (Number(tier.supply) || 0), 0);

  // Validate inputs
  const validateInputs = () => {
    if (!isLoggedIn || !principal) return 'You must be logged in to create an event.';
    if (!eventName) return 'Event name is required.';
    if (!eventDescription) return 'Event description is required.';
    if (!eventDate || !eventTime) return 'Event date and time are required.';
    if (!durationMinutes || Number(durationMinutes) <= 0) return 'Duration must be a positive number.';
    if (ticketTiers.length === 0) return 'At least one ticket tier is required.';
    for (const tier of ticketTiers) {
      if (!tier.desc) return 'Each ticket tier must have a description.';
      if (!tier.price || Number(tier.price) < 0) return 'Each ticket tier must have a non-negative price.';
      if (!tier.supply || Number(tier.supply) <= 0) return 'Each ticket tier must have a positive quantity.';
    }
    return null;
  };

  // Convert TicketKind to Motoko-compatible variant
  const convertTicketKind = (kind) => {
    if ('Seatless' in kind) return { Seatless: null };
    if ('Seated' in kind) return { Seated: { seatInfo: kind.Seated || 'General Seating' } };
    throw new Error('Invalid ticket kind');
  };

  // Reset form for creating another event
  const resetForm = () => {
    setEventName('');
    setEventDescription('');
    setEventDate('');
    setEventTime('');
    setDurationMinutes('');
    setTicketTiers([{ desc: 'General Admission', price: '', supply: '', kind: { Seatless: null } }]);
    setSuccessModalOpen(false);
    setError('');
  };

  const handleCreateEvent = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      console.error('Validation error:', validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Create the main Event
      const eventActor = createEventActor(eventCanisterId, { agentOptions: { identity: authClient.getIdentity() } });
      const date = new Date(`${eventDate}T${eventTime}`);
      if (isNaN(date.getTime())) {
        const errMsg = 'Invalid date or time.';
        console.error(errMsg, { eventDate, eventTime });
        throw new Error(errMsg);
      }
      const dateInNanoseconds = BigInt(date.getTime()) * 1_000_000n;
      const organizerId = principal.toText();

      console.log('Creating event with inputs:', {
        eventName,
        organizerId,
        eventDescription,
        dateInNanoseconds,
        durationMinutes,
        totalTicketSupply,
        prices: ticketTiers.map((tier) => BigInt(tier.price || 0)),
        kind: convertTicketKind(ticketTiers[0].kind),
        valid: true,
      });

      const createdEvent = await eventActor.createEvent(
        eventName,
        organizerId,
        eventDescription,
        dateInNanoseconds,
        BigInt(durationMinutes),
        BigInt(totalTicketSupply),
        ticketTiers.map((tier) => BigInt(tier.price || 0)),
        convertTicketKind(ticketTiers[0].kind),
        true
      );
      console.log('Event created successfully:', createdEvent);

      // Verify event storage
      const allEvents = await eventActor.getAllEvents();
      console.log('All events after creation:', allEvents);

      // Step 2: Create a Master Ticket for EACH tier
      const masterTicketActor = createMasterTicketActor(masterTicketCanisterId, {
        agentOptions: { identity: authClient.getIdentity() },
      });
      for (const tier of ticketTiers) {
        console.log('Creating master ticket with inputs:', {
          eventId: createdEvent.id,
          ticketDesc: tier.desc,
          price: BigInt(tier.price),
          kind: convertTicketKind(tier.kind),
        });
        await masterTicketActor.createMasterTicket(
          createdEvent.id,
          tier.desc,
          BigInt(tier.price),
          convertTicketKind(tier.kind)
        );
        console.log(`Master ticket "${tier.desc}" created for Event ID: ${createdEvent.id}`);
      }

      // Show success modal
      setCreatedEventId(createdEvent.id);
      setSuccessModalOpen(true);
    } catch (err) {
      console.error('Failed to create event or tickets:', {
        message: err.message,
        stack: err.stack,
        eventInputs: { eventName, eventDate, eventTime, durationMinutes, ticketTiers },
      });
      setError(`Failed to create event: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-[#11071F]">
        <Loader2 className="h-12 w-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl">
        <Link to="/events" className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Create a New Event</h1>
          <p className="text-lg text-purple-300/80 mt-1">Fill out the details below to list your event on DigiPurse.</p>
        </header>

        <div className="space-y-8">
          {/* Step 1: Event Details */}
          <Card className="bg-white/5 border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-purple-300">1. Event Details</CardTitle>
              <CardDescription>Provide the core information about your event.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., ICP Innovate Summit"
                  className="bg-black/20 border-purple-400/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDescription">Event Description</Label>
                <textarea
                  id="eventDescription"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Tell us more about your event..."
                  className="w-full min-h-[120px] bg-black/20 border-purple-400/30 rounded-md p-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="bg-black/20 border-purple-400/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTime">Start Time</Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="bg-black/20 border-purple-400/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    min="1"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="e.g., 180"
                    className="bg-black/20 border-purple-400/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Ticket Tiers */}
          <Card className="bg-white/5 border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-purple-300">2. Ticket Tiers</CardTitle>
              <CardDescription>Define the different types of tickets for your event.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketTiers.map((tier, index) => (
                <div key={index} className="p-4 bg-black/20 rounded-lg border border-purple-400/20">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Ticket Tier #{index + 1}</h4>
                    {ticketTiers.length > 1 && (
                      <Button variant="destructive" size="icon" onClick={() => removeTier(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`tier-desc-${index}`}>Tier Name</Label>
                      <Input
                        id={`tier-desc-${index}`}
                        value={tier.desc}
                        onChange={(e) => handleTierChange(index, 'desc', e.target.value)}
                        placeholder="e.g., VIP Access"
                        className="bg-black/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`tier-price-${index}`}>Price (ICP)</Label>
                      <Input
                        id={`tier-price-${index}`}
                        type="number"
                        min="0"
                        value={tier.price}
                        onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                        placeholder="e.g., 150"
                        className="bg-black/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`tier-supply-${index}`}>Quantity</Label>
                      <Input
                        id={`tier-supply-${index}`}
                        type="number"
                        min="1"
                        value={tier.supply}
                        onChange={(e) => handleTierChange(index, 'supply', e.target.value)}
                        placeholder="e.g., 100"
                        className="bg-black/30"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label>Ticket Kind</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={'Seatless' in tier.kind ? 'secondary' : 'outline'}
                        onClick={() => handleTierChange(index, 'kind', { Seatless: null })}
                        className="flex-1 text-sm"
                      >
                        <Users className="mr-2 h-4 w-4" /> Seatless
                      </Button>
                      <Button
                        variant={'Seated' in tier.kind ? 'secondary' : 'outline'}
                        onClick={() => handleTierChange(index, 'kind', { Seated: 'General Seating' })}
                        className="flex-1 text-sm"
                      >
                        <Armchair className="mr-2 h-4 w-4" /> Seated
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addTier} className="w-full mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Tier
              </Button>
            </CardContent>
          </Card>

          {/* Step 3: Review & Create */}
          <Card className="bg-purple-900/20 border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-purple-300 text-2xl font-bold">3. Review & Create</CardTitle>
              <CardDescription className="text-purple-300/70">
                Confirm your event details and create the event with its ticket tiers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-purple-300">Event Details</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300/80">Event Name:</span>
                    <span className="font-medium">{eventName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300/80">Date & Time:</span>
                    <span className="font-medium">
                      {eventDate && eventTime
                        ? new Date(`${eventDate}T${eventTime}`).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300/80">Duration:</span>
                    <span className="font-medium">{durationMinutes ? `${durationMinutes} minutes` : 'Not set'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-purple-300">Ticket Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300/80">Ticket Tiers:</span>
                    <span className="font-medium">{ticketTiers.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300/80">Total Ticket Supply:</span>
                    <span className="font-medium">{totalTicketSupply || '0'}</span>
                  </div>
                </div>
              </div>
              {/* Ticket Tiers Table */}
              {ticketTiers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-purple-300">Ticket Tiers</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-purple-300/80">
                      <thead className="text-xs uppercase bg-black/20">
                        <tr>
                          <th className="px-4 py-2">Tier Name</th>
                          <th className="px-4 py-2">Price (ICP)</th>
                          <th className="px-4 py-2">Quantity</th>
                          <th className="px-4 py-2">Kind</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ticketTiers.map((tier, index) => (
                          <tr key={index} className="border-b border-purple-400/20">
                            <td className="px-4 py-2">{tier.desc || 'Not set'}</td>
                            <td className="px-4 py-2">{tier.price || '0'}</td>
                            <td className="px-4 py-2">{tier.supply || '0'}</td>
                            <td className="px-4 py-2">
                              {'Seatless' in tier.kind ? 'Seatless' : `Seated (${tier.kind.Seated || 'General Seating'})`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* Feedback Messages */}
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {/* Create Button */}
              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={handleCreateEvent}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Ticket className="mr-2 h-5 w-5" />}
                  {isLoading ? 'Creating...' : 'Create Event & Tickets'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Modal */}
        <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
          <DialogContent className="bg-[#11071F] text-white border-purple-400/20">
            <DialogHeader>
              <DialogTitle className="text-purple-300 text-2xl">Event Created Successfully!</DialogTitle>
              <DialogDescription className="text-purple-300/70">
                Your event "{eventName}" (ID: {createdEventId}) has been created with {ticketTiers.length} ticket tier
                {ticketTiers.length === 1 ? '' : 's'}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={resetForm}
                className="w-full sm:w-auto border-purple-400/30 text-purple-300 hover:bg-purple-600 hover:text-white"
              >
                Create Another Event
              </Button>
              <Button
                onClick={() => navigate('/events')}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
              >
                Go to Events
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}