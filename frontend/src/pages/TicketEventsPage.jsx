import React, { useEffect, useState, useMemo } from 'react';
import { createActor, canisterId } from 'declarations/Event_backend';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Tag, Search, FilterX, ArrowLeft, ArrowRight, Armchair, Users, Ticket, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

const EVENTS_PER_PAGE = 5;

export default function EventsPage() {
  const navigate = useNavigate(); // FIX: Initialize the navigate hook
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOrganizer, setIsOrganizer] = useState(true); // Mock state for organizer role
  const { authClient } = useAuth();
  const identity = authClient ? authClient.getIdentity() : null;
  const principal = identity ? identity.getPrincipal() : null;


  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1_000 });
  const [seatType, setSeatType] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const actor = createActor(canisterId, { agentOptions: { identity } });
        const response = await actor.getAllEvents();
        // console.log(response);
        // response: Array<[string, Event]>
        const parsed = response.map(([id, event]) => {
          const isSeated = event.kind.hasOwnProperty('Seated');
          const isSeatless = event.kind.hasOwnProperty('Seatless');
          const prices = event.prices.map(p => Number(p));
          return {
            eventID: event.id,
            organizerID: event.organizerId,
            eventName: event.name,
            eventDesc: event.description,
            eventDate: new Date(Number(event.date) / 1_000_000),
            eventDuration: Number(event.durationMinutes),
            ticketCount: Number(event.ticketSupply),
            minPrice: Number(Math.min(...prices)),
            maxPrice: Number(Math.max(...prices)),
            seatInfo: isSeated ? event.kind.Seated.seatInfo : '',
            hasSeated: isSeated,
            hasSeatless: isSeatless,
            image: `https://placehold.co/300x300/1E0A2E/FFFFFF?text=${event.name.split(' ').map(w => w[0]).join('')}`
          };
        });
        console.log("parsed:", parsed);
        setAllEvents(parsed);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, []);

  useMemo(() => {
    let events = allEvents;
    console.log("Total before filtering:", events.length);

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      events = events.filter(event =>
        event.eventName.toLowerCase().includes(lowercasedTerm)
      );
      console.log("After searchTerm filter:", events.length);
    }

    events = events.filter(
      event => Number(event.minPrice) >= priceRange.min && Number(event.maxPrice) <= priceRange.max
    );
    console.log("After priceRange filter:", events.length);

    if (seatType === 'seated') {
      events = events.filter(event => event.hasSeated);
      console.log("After seated filter:", events.length);
    } else if (seatType === 'seatless') {
      events = events.filter(event => event.hasSeatless);
      console.log("After seatless filter:", events.length);
    }

    setFilteredEvents(events);
    setCurrentPage(1);
  }, [allEvents, searchTerm, priceRange, seatType]);


  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const currentEvents = filteredEvents.slice((currentPage - 1) * EVENTS_PER_PAGE, currentPage * EVENTS_PER_PAGE);

  const handleResetFilters = () => {
    setSearchTerm('');
    setPriceRange({ min: 0, max: 250 });
    setSeatType('all');
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Discover Events
            </h1>
            <p className="text-lg text-purple-300/80 mt-2">Find and secure your spot at the next big Web3 gathering.</p>
          </div>
          {isOrganizer && (
            <div className="mt-4 sm:mt-0 flex-shrink-0">
              <Button onClick={() => navigate('/create-event')}>
                <PlusCircle className="mr-2 h-5 w-5" /> Create New Event
              </Button>
            </div>
          )}
        </header>

        {/* Filters Bar */}
        <Card className="bg-white/5 border-purple-400/20 p-4 mb-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="search">Search Event Name</Label>
              <Input id="search" placeholder="e.g., ICP Innovate..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/20 border-purple-400/30" />
            </div>
            <div className="space-y-2">
              <Label>Ticket Type</Label>
              <div className="flex gap-2">
                <Button variant={seatType === 'seated' ? 'secondary' : 'outline'} onClick={() => setSeatType('seated')} className="flex-1 text-sm">Seated</Button>
                <Button variant={seatType === 'seatless' ? 'secondary' : 'outline'} onClick={() => setSeatType('seatless')} className="flex-1 text-sm">Seatless</Button>
              </div>
            </div>
            <div className="text-center mt-4">
              <Button variant="ghost" onClick={handleResetFilters} className="text-purple-300/70 hover:text-white">
                <FilterX className="mr-2 h-4 w-4" /> Reset Filters
              </Button>
            </div>
          </div>

        </Card>

        {/* Events List */}
        <main className="space-y-6">
          {currentEvents.map(event => (
            <Link key={event.eventID} to={`/events/${event.eventID}`} state={{ event }}>
              <Card className="bg-white/5 border border-purple-400/20 hover:border-purple-400/60 transition-all duration-300 overflow-hidden flex flex-col md:flex-row group">
                {/* Event Image */}
                <div className="w-full md:w-64 flex-shrink-0">
                  <img src={event.image} alt={event.eventName} className="w-full h-48 md:h-full object-cover" />
                </div>
                {/* Event Details */}
                <div className="p-6 flex-grow flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                  <div className="flex-grow">
                    <CardTitle className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{event.eventName}</CardTitle>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-purple-300/80">
                      <span className="flex items-center gap-2"><Ticket className="h-4 w-4" /> {event.ticketCount} Tickets Available</span>
                      <span className="flex items-center gap-2"><Tag className="h-4 w-4" />From {event.minPrice} to {event.maxPrice} ICP</span>
                      <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {event.eventDate.toLocaleDateString()}</span>
                      {event.hasSeated && <span className="flex items-center gap-2"><Armchair className="h-4 w-4" /> Seated</span>}
                      {event.hasSeatless && <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Seatless</span>}
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 md:mt-0 w-full md:w-auto">
                    <Button className="w-full md:w-auto">View Tickets</Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </main>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-8 space-x-4">
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span className="font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
