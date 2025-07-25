import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PlusCircle, Ticket, Armchair, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createActor as createEventActor, canisterId as eventCanisterId } from '@/declarations/Event_backend';
import { createActor as createTicketActor, canisterId as ticketCanisterId } from '@/declarations/MasterTicket_backend';
import { useAuth } from '@/lib/AuthContext';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { authClient } = useAuth();
  const identity = authClient ? authClient.getIdentity() : null;
  const principal = identity ? identity.getPrincipal() : null;
  
  // State for Event Details
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  
  // State for Single Ticket Type
  const [ticketPrice, setTicketPrice] = useState('');
  const [ticketSupply, setTicketSupply] = useState('');
  const [ticketKind, setTicketKind] = useState('#Seatless'); // Default to Seatless

  const handleCreateEvent = async () => {
    // In a real app, you would format this data according to your Motoko types
    // and send it to your backend canister.
    const eventData = {
      name: eventName,
      description: eventDescription,
      date: new Date(`${eventDate}T${eventTime}`),
      durationMinutes: Number(durationMinutes),
      ticketSupply: Number(ticketSupply),
    };
    
    const ticketData = {
        price: Number(ticketPrice),
        quantity: Number(ticketSupply),
        kind: ticketKind === '#Seated' ? { '#Seated': { seatInfo: 'General Seating' } } : { '#Seatless': null }
    };

    const eventActor = createEventActor(eventCanisterId, { agentOptions: { identity } });
    await eventActor.createEvent(
      eventName,
      "OR-001",
      eventDescription,
      BigInt(new Date(`${eventDate}T${eventTime}`).getTime()) * 1_000_000n,
      BigInt(durationMinutes),
      BigInt(ticketSupply),
      [BigInt(ticketPrice)],
      ticketKind === '#Seated' ? { Seated: { seatInfo: '22' } } : { Seatless: null },
      true
    );

    const ticketActor = createTicketActor(ticketCanisterId, { agentOptions: { identity } });
    await ticketActor.createMasterTicket(
      "event-001",
      eventDescription,
      BigInt(ticketPrice),
      ticketKind === '#Seated' ? { Seated: { seatInfo: ' 22' } } : { Seatless: null }
    );

    console.log("Creating Event:", eventData);
    console.log("With Ticket Details:", ticketData);
    
    navigate('/events');
  };

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
                <Input id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g., ICP Innovate Summit" className="bg-black/20 border-purple-400/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDescription">Event Description</Label>
                <textarea id="eventDescription" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Tell us more about your event..." className="w-full min-h-[120px] bg-black/20 border-purple-400/30 rounded-md p-2 text-sm" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="eventDate">Date</Label>
                  <Input id="eventDate" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="bg-black/20 border-purple-400/30" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="eventTime">Start Time</Label>
                  <Input id="eventTime" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="bg-black/20 border-purple-400/30" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
                  <Input id="durationMinutes" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="e.g., 180" className="bg-black/20 border-purple-400/30" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Ticket Details */}
          <Card className="bg-white/5 border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-purple-300">2. Ticket Details</CardTitle>
              <CardDescription>Define the price, supply, and type of tickets for your event.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="ticketPrice">Price (ICP)</Label>
                      <Input id="ticketPrice" type="number" value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} placeholder="e.g., 50" className="bg-black/30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticketSupply">Total Ticket Supply</Label>
                      <Input id="ticketSupply" type="number" value={ticketSupply} onChange={(e) => setTicketSupply(e.target.value)} placeholder="e.g., 500" className="bg-black/30" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Ticket Kind</Label>
                    <div className="flex gap-2">
                        <Button variant={ticketKind === '#Seatless' ? 'secondary' : 'outline'} onClick={() => setTicketKind('#Seatless')} className="flex-1 text-sm"><Users className="mr-2 h-4 w-4" /> Seatless</Button>
                        <Button variant={ticketKind === '#Seated' ? 'secondary' : 'outline'} onClick={() => setTicketKind('#Seated')} className="flex-1 text-sm"><Armchair className="mr-2 h-4 w-4" /> Seated</Button>
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* Final Step: Review and Create */}
          <Card className="bg-purple-900/20 border-purple-400/20">
            <CardHeader>
                <CardTitle className="text-purple-300">3. Review & Create</CardTitle>
                <CardDescription>Review the details below before creating your event.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="space-y-3 text-sm flex-grow">
                    <div className="flex justify-between">
                        <span className="text-purple-300/80">Event Name:</span>
                        <span className="font-semibold">{eventName || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-purple-300/80">Date & Time:</span>
                        <span className="font-semibold">{eventDate && eventTime ? new Date(`${eventDate}T${eventTime}`).toLocaleString() : 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-purple-300/80">Ticket Price:</span>
                        <span className="font-semibold">{ticketPrice ? `${ticketPrice} ICP` : 'Not set'}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-purple-300/80">Ticket Kind:</span>
                        <span className="font-semibold">{ticketKind === '#Seated' ? 'Seated' : 'Seatless'}</span>
                    </div>
                </div>
                <div className="text-center sm:text-right w-full sm:w-auto flex-shrink-0 sm:pl-8">
                    <p className="text-lg font-bold">Total Ticket Supply</p>
                    <p className="text-4xl font-bold text-purple-300">{Number(ticketSupply) || 0}</p>
                    <Button size="lg" onClick={handleCreateEvent} className="mt-4 w-full sm:w-auto">
                        <Ticket className="mr-2 h-5 w-5" />
                        Create Event & Tickets
                    </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
