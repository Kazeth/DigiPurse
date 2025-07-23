import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PlusCircle, Upload, Calendar, Clock, Ticket } from 'lucide-react';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [duration, setDuration] = useState('');
  const [ticketSupply, setTicketSupply] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCreateEvent = () => {
    // In a real app, you would collect all the state data,
    // combine date and time, and send it to your backend canister.
    console.log({
      eventName,
      eventDescription,
      eventDateTime: `${eventDate}T${eventTime}`,
      duration,
      ticketSupply,
      // image file would be uploaded here
    });
    // After successful creation, navigate back to the events page
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

        <Card className="bg-white/5 border-purple-400/20">
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
            <CardDescription>Provide the core details about your event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g., ICP Innovate Summit" className="bg-black/20 border-purple-400/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventImage">Event Image</Label>
                <Input id="eventImage" type="file" onChange={handleImageChange} className="bg-black/20 border-purple-400/30 file:text-purple-300" />
              </div>
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
                <Label htmlFor="duration">Duration (Minutes)</Label>
                <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 180" className="bg-black/20 border-purple-400/30" />
              </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="ticketSupply">Total Ticket Supply</Label>
                <Input id="ticketSupply" type="number" value={ticketSupply} onChange={(e) => setTicketSupply(e.target.value)} placeholder="e.g., 500" className="bg-black/20 border-purple-400/30" />
              </div>
            <div className="flex justify-end mt-6">
              <Button size="lg" onClick={handleCreateEvent}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
