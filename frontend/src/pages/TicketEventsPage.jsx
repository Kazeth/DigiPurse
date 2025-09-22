"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createActor, canisterId } from 'declarations/Event_backend';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // NEW: For better filter UI
import { Slider } from '@/components/ui/slider'; // NEW: For price filter
import { Calendar, Tag, Search, FilterX, ArrowLeft, ArrowRight, Armchair, Users, Ticket, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';

const EVENTS_PER_PAGE = 6;

export default function EventsPage() {
    const navigate = useNavigate();
    const [allEvents, setAllEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isOrganizer, setIsOrganizer] = useState(true); // This should be based on user role
    const { authClient } = useAuth();
    const identity = authClient ? authClient.getIdentity() : null;

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState([0, 1000]); // MODIFIED: Use array for slider
    const [seatType, setSeatType] = useState('all');

    // --- All your existing functions and useEffect hooks for data fetching remain unchanged ---
        useEffect(() => {
    const fetchEvents = async () => {
      try {
        const actor = createActor(canisterId, { agentOptions: { identity } });
        const response = await actor.getAllEvents();
        const parsed = response.map(([id, event]) => {
          const isSeated = event.kind.hasOwnProperty('Seated');
          const isSeatless = event.kind.hasOwnProperty('Seatless');
          const prices = event.prices.map(p => Number(p));
          return {
            eventID: event.id,
            organizer: event.organizer,
            eventName: event.name,
            eventDesc: event.description,
            eventDate: new Date(Number(event.date) / 1_000_000),
            eventDuration: Number(event.durationMinutes),
            ticketCount: Number(event.ticketSupply),
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            seatInfo: isSeated ? event.kind.Seated.seatInfo : '',
            hasSeated: isSeated,
            hasSeatless: isSeatless,
            // MODIFIED: Updated placeholder for better contrast
            image: `https://placehold.co/600x400/11071F/7C3AED/png?text=${encodeURIComponent(event.name)}`
          };
        });
        setAllEvents(parsed);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, [identity]);

    const filteredEvents = useMemo(() => {
        return allEvents
            .filter(event => event.eventName.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(event => event.minPrice >= priceRange[0] && event.maxPrice <= priceRange[1])
            .filter(event => {
                if (seatType === 'seated') return event.hasSeated;
                if (seatType === 'seatless') return event.hasSeatless;
                return true;
            });
    }, [allEvents, searchTerm, priceRange, seatType]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredEvents]);

    const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
    const currentEvents = filteredEvents.slice((currentPage - 1) * EVENTS_PER_PAGE, currentPage * EVENTS_PER_PAGE);

    const handleResetFilters = () => {
        setSearchTerm('');
        setPriceRange([0, 1000]);
        setSeatType('all');
    };

    return (
        // --- MODIFIED: Main page container with consistent styling ---
        <div className="min-h-screen w-full bg-black text-white px-4 sm:px-6 lg:px-8 pt-28 pb-12
                        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                        from-purple-900/40 via-fuchsia-900/10 to-black">
            <div className="container mx-auto">
                <motion.header 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 pb-8 border-b border-white/10"
                >
                    <div className="text-center sm:text-left">
                        <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                            Discover Events
                        </h1>
                        <p className="text-lg text-purple-300/80 mt-2" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                            Find and secure your spot at the next big Web3 gathering.
                        </p>
                    </div>
                    {isOrganizer && (
                        <div className="flex-shrink-0">
                            <Button onClick={() => navigate('/create-event')} className="bg-purple-600 hover:bg-purple-700 text-base px-6 py-5" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                <PlusCircle className="mr-2 h-5 w-5" /> Create New Event
                            </Button>
                        </div>
                    )}
                </motion.header>

                {/* --- MODIFIED: Filter bar with "glass" effect and improved controls --- */}
                <Card className="bg-black/30 backdrop-blur-sm border border-white/10 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="lg:col-span-2 space-y-2">
                            <Label htmlFor="search" className="text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Search Event</Label>
                            <Input id="search" placeholder="e.g., ICP Innovate..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/20 border-purple-400/30 h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Price Range (ICP)</Label>
                            <div className="flex justify-between text-sm text-purple-300">
                                <span>{priceRange[0]}</span>
                                <span>{priceRange[1]}+</span>
                            </div>
                             <Slider defaultValue={[0, 1000]} max={1000} step={10} value={priceRange} onValueChange={setPriceRange} />
                        </div>
                        <div className="space-y-2">
                             <Label className="text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Ticket Type</Label>
                             <Tabs value={seatType} onValueChange={setSeatType} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-black/20 h-12">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="seated">Seated</TabsTrigger>
                                    <TabsTrigger value="seatless">Seatless</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                    <div className="text-center mt-6">
                         <Button variant="ghost" onClick={handleResetFilters} className="text-purple-300/70 hover:text-white"><FilterX className="mr-2 h-4 w-4" /> Reset Filters</Button>
                    </div>
                </Card>

                {/* --- MODIFIED: Events List with "glass" cards and empty state --- */}
                <main className="space-y-6">
                    {currentEvents.length > 0 ? (
                        currentEvents.map(event => (
                            <motion.div key={event.eventID} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <Link to={`/events/${event.eventID}`} state={{ event }}>
                                    <Card className="bg-black/30 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition-all duration-300 overflow-hidden flex flex-col md:flex-row group hover:-translate-y-1">
                                        <div className="w-full md:w-64 flex-shrink-0 bg-black/20"><img src={event.image} alt={event.eventName} className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
                                        <div className="p-6 flex-grow flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                                            <div className="flex-grow">
                                                <CardTitle className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors" style={{ fontFamily: 'AeonikBold, sans-serif' }}>{event.eventName}</CardTitle>
                                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-purple-300/80">
                                                    <span className="flex items-center gap-2"><Ticket className="h-4 w-4" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}>{event.ticketCount} Tickets</span></span>
                                                    <span className="flex items-center gap-2"><Tag className="h-4 w-4" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}>{event.minPrice} - {event.maxPrice} ICP</span></span>
                                                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}>{event.eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
                                                    {event.hasSeated && <span className="flex items-center gap-2"><Armchair className="h-4 w-4" /> Seated</span>}
                                                    {event.hasSeatless && <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Seatless</span>}
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-4 md:mt-0 w-full md:w-auto"><Button className="w-full md:w-auto bg-purple-600 hover:bg-purple-700" style={{ fontFamily: 'AeonikBold, sans-serif' }}>View Tickets</Button></div>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <div className="mt-16 text-center text-purple-300/70 flex flex-col items-center">
                            <div className="w-full max-w-lg bg-black/30 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-12">
                                <FilterX className="h-16 w-16 mb-4 text-purple-400/50" />
                                <p className="text-xl font-medium text-white" style={{ fontFamily: 'AeonikBold, sans-serif' }}>No Events Found</p>
                                <p className="mt-2" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Try adjusting your filters to find more events.</p>
                            </div>
                        </div>
                    )}
                </main>

                {/* --- MODIFIED: Pagination styling --- */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center mt-12 space-x-4">
                        <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
                        <span className="font-semibold text-purple-200" style={{ fontFamily: 'AeonikBold, sans-serif' }}>Page {currentPage} of {totalPages}</span>
                        <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                )}
            </div>
        </div>
    );
}