"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar, Ticket as TicketIcon, Users, Tag, CheckCircle, XCircle, Store, Trash2, PanelLeftClose, PanelLeftOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { createActor as createTicketActor, canisterId as ticketCanisterId } from '@/declarations/Ticket_backend';
import { createActor as createEventActor, canisterId as eventCanisterId } from '@/declarations/Event_backend';
import { motion, AnimatePresence } from 'framer-motion';

export default function DigiTicketPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authClient, principal } = useAuth();

  const [myTickets, setMyTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [isListVisible, setIsListVisible] = useState(true);
  const [isTicketIdVisible, setIsTicketIdVisible] = useState(false);

  // Main useEffect to fetch data from the backend on component load
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!authClient || !principal) return;

      setIsLoading(true);
      try {
        const identity = authClient.getIdentity();

        // Create actors for ticket and event canisters
        const ticketActor = createTicketActor(ticketCanisterId, { agentOptions: { identity } });
        const eventActor = createEventActor(eventCanisterId, { agentOptions: { identity } });

        // Fetch user's tickets and all events in parallel
        const [userTicketsResult, allEventsResult] = await Promise.all([
          ticketActor.getAllUserTicket(principal),
          eventActor.getAllEvents()
        ]);

        // Transform ticket data from the backend
        const formattedTickets = userTicketsResult.flatMap(([eventId, tickets]) =>
          tickets
            .filter(ticket => ticket.isOnMarketplace === false)
            .map(ticket => ({
              ticketID: ticket.ticketID,
              eventID: eventId,
              ticketDesc: ticket.ticketDesc,
              price: Number(ticket.price),
              kind: ticket.kind,
              owner: ticket.owner.toText(),
              valid: ticket.valid,
              isOnMarketplace: ticket.isOnMarketplace,
              id: ticket.id ?? ticket.ticketID,
              forSale: ticket.forSale ?? ticket.isOnMarketplace,
            }))
        );

        // Transform event data from the backend
        const formattedEvents = allEventsResult.map(([id, event]) => ({
          id: event.id,
          name: event.name,
          description: event.description,
          date: new Date(Number(event.date / 1000000n)), // Convert nanoseconds to milliseconds
        }));

        setMyTickets(formattedTickets);
        setEvents(formattedEvents);

        // Select the first ticket by default if available
        if (formattedTickets.length > 0) {
          setSelectedTicket(formattedTickets[0]);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [authClient, principal]);
  
  // All other functions (useEffect for new ticket, getEventForTicket, etc.) remain unchanged...
    useEffect(() => {
    const newTicketData = location.state?.newTicket;
    if (newTicketData) {
      const { eventDetail, ...ticketOnlyData } = newTicketData;

      setMyTickets(prev => {
        if (!prev.some(t => t.id === ticketOnlyData.id)) {
          return [ticketOnlyData, ...prev];
        }
        return prev;
      });

      if (eventDetail && !events.some(e => e.id === eventDetail.id)) {
        setEvents(prev => [...prev, eventDetail]);
      }

      setSelectedTicket(ticketOnlyData);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, events]);

  const getEventForTicket = (ticket) => {
    if (!ticket) return null;
    return events.find(e => e.id === ticket.eventID);
  };

  const handleCancelListing = (ticketId) => {
    setMyTickets(currentTickets =>
      currentTickets.map(t =>
        t.id === ticketId ? { ...t, forSale: false } : t
      )
    );
    setSelectedTicket(prev => (prev?.id === ticketId ? { ...prev, forSale: false } : prev));
  };

  useEffect(() => {
    setIsTicketIdVisible(false);
  }, [selectedTicket]);


  const selectedEvent = getEventForTicket(selectedTicket);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen bg-black">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
        </div>
    );
  }

  return (
    // --- MODIFIED: Main page container with consistent styling ---
    <div className="min-h-screen w-full bg-black text-white px-4 sm:px-6 lg:px-8 pt-28 pb-12
                    bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                    from-purple-900/40 via-fuchsia-900/10 to-black">
      <div className="container mx-auto">
        <motion.header 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-8 border-b border-white/10"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
              My Tickets
            </h1>
            <p className="text-lg text-purple-300/80 mt-1" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
              Manage your event access and digital ownership.
            </p>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- MODIFIED: Collapsible Ticket List Sidebar --- */}
          <AnimatePresence>
            {isListVisible && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-1 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                    Your Tickets ({myTickets.length})
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsListVisible(false)} className="text-purple-300/70 hover:text-white">
                    <PanelLeftClose />
                  </Button>
                </div>
                <div className="space-y-3 h-[65vh] overflow-y-auto pr-2">
                  {myTickets.map(ticket => {
                    const event = getEventForTicket(ticket);
                    return (
                      <Card
                        key={ticket.id}
                        className={cn(
                          "cursor-pointer bg-black/20 border border-white/10 hover:border-purple-400/50 transition-all",
                          selectedTicket?.id === ticket.id && "border-purple-400/80 ring-2 ring-purple-400/50"
                        )}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-lg" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                              {event?.name || "Event Not Found"}
                            </p>
                            <p className="text-sm text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                              {event?.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          {ticket.forSale ? (
                            <Store className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                          ) : (
                            ticket.valid ? <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" /> : <XCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- MODIFIED: Main Ticket Detail View --- */}
          <div className={cn("transition-all duration-300", isListVisible ? "lg:col-span-2" : "lg:col-span-3")}>
            {!isListVisible && (
              <Button variant="ghost" onClick={() => setIsListVisible(true)} className="mb-4 text-purple-300/70 hover:text-white">
                <PanelLeftOpen className="mr-2" /> Show Ticket List
              </Button>
            )}
            {selectedTicket && selectedEvent ? (
              <Card className="bg-black/30 backdrop-blur-sm border border-white/10 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                    {selectedEvent.name}
                  </CardTitle>
                  <CardDescription className="text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                    {selectedEvent.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-purple-400" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}>{selectedEvent.date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></div>
                        <div className="flex items-center gap-3"><Users className="h-5 w-5 text-purple-400" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}>Owner: You ({principal.toText().slice(0, 5)}...{principal.toText().slice(-3)})</span></div>
                        <div className="flex items-center gap-3"><Tag className="h-5 w-5 text-purple-400" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}>Original Price: {selectedTicket.price} ICP</span></div>
                        {'#Seated' in selectedTicket.kind && (
                           <div className="flex items-center gap-3"><TicketIcon className="h-5 w-5 text-purple-400" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}>Seat: {selectedTicket.kind['#Seated'].seatInfo}</span></div>
                        )}
                    </div>
                    {/* Thematic Ticket Stub */}
                    <div className="flex flex-col items-center justify-center bg-black/20 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                           <p className="text-sm uppercase tracking-wider text-purple-300/70" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Ticket ID</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-purple-300/70 hover:text-white" onClick={() => setIsTicketIdVisible(!isTicketIdVisible)}>
                                {isTicketIdVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className={`text-xl font-bold tracking-widest text-center break-all transition-all duration-300 ${isTicketIdVisible ? 'blur-0' : 'blur-sm'}`} style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                           {isTicketIdVisible ? selectedTicket.ticketID : '••••••••••••••••'}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="p-6 border-t border-white/10 mt-auto">
                    <div className="w-full space-y-2">
                        {selectedTicket.forSale ? (
                            <Button className="w-full" variant="destructive" onClick={() => handleCancelListing(selectedTicket.id)} style={{ fontFamily: 'AeonikBold, sans-serif' }}><Trash2 className="mr-2 h-4 w-4" /> Cancel Listing</Button>
                        ) : (
                            selectedTicket.valid ? (
                                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/sell-ticket', { state: { ticket: selectedTicket } })} style={{ fontFamily: 'AeonikBold, sans-serif' }}><Store className="mr-2 h-4 w-4" /> Sell on Marketplace</Button>
                            ) : (
                                <p className="text-center text-red-400 font-semibold p-2 bg-red-900/20 rounded-md" style={{ fontFamily: 'AeonikBold, sans-serif' }}>This ticket has been used.</p>
                            )
                        )}
                        <Button className="w-full" variant="outline" disabled={!selectedTicket.valid} style={{ fontFamily: 'AeonikBold, sans-serif' }}>Transfer Ownership</Button>
                        <Link to={`/events/${selectedTicket.eventID}`} className="block"><Button className="w-full" variant="ghost" style={{ fontFamily: 'AeonikBold, sans-serif' }}>View Event Details</Button></Link>
                    </div>
                </CardFooter>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full bg-black/30 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-2xl">
                <p className="text-purple-300/70 text-lg" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                  Select a ticket to view its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}