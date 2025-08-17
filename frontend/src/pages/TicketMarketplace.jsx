import React, { useState, useEffect, useMemo } from 'react';
import { Event_backend } from 'declarations/Event_backend';
import { Ticket_backend } from '@/declarations/Ticket_backend';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Tag, Search, FilterX, ArrowLeft, ArrowRight, Armchair, User, PlusCircle, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '../lib/AuthContext';
import { Identity_backend } from 'declarations/Identity_backend';
import { cn } from '@/lib/utils';
import { createActor, canisterId } from '@/declarations/Ticket_backend';

const mockEvents = [
  { eventID: "EVT-001", eventName: "ICP Hackathon 2025", eventDate: new Date('2025-08-01T09:00:00') },
  { eventID: "WEB3SUMMIT", eventName: "Web3 Summit", eventDate: new Date('2025-09-15T10:00:00') },
  { eventID: "DEVFEST", eventName: "DevFest Global", eventDate: new Date('2025-10-20T11:00:00') },
];

const TICKETS_PER_PAGE = 9;

export default function MarketplacePage() {
  const navigate = useNavigate();
  const { isAuthenticated, principal } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allMarketplaceTickets, setAllMarketplaceTickets] = useState([]);
  const [eventsMap, setEventsMap] = useState(new Map());
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(250);
  const [filterDate, setFilterDate] = useState('');
  const [seatType, setSeatType] = useState('all');
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [purchasedTicket, setPurchasedTicket] = useState(null);

  const { eventID } = useParams();
  const { authClient } = useAuth();

  useEffect(() => {
    const checkAndFetchData = async () => {
      if (!isAuthenticated || !principal) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const identityOpt = await Identity_backend.getIdentity(principal);
        if (identityOpt.length > 0 && identityOpt[0].isVerified) {
          setIsVerified(true);
          // Fetch events
          const eventResponse = await Event_backend.getAllEvents();
          const events = new Map(eventResponse.map(([id, event]) => [id, event]));
          setEventsMap(events);
          console.log(events);
        } else {
          setIsVerified(false);
        }
      } catch (error) {
        console.error("Failed to check identity or fetch data:", error);
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchTickets = async () => {
      if (!isAuthenticated || !principal) return;
      setIsLoading(true);
      try {
        const identityOpt = await Identity_backend.getIdentity(principal);
        if (identityOpt.length > 0 && identityOpt[0].isVerified) {
          setIsVerified(true);
          // Fetch tickets
          const ticketResponse = await Ticket_backend.getAllOnSaleTicket();
          console.log(ticketResponse);
          const parsed = ticketResponse.flatMap(([eventId, tickets]) =>
            tickets.map(ticket => ({
              ticketID: ticket.ticketID,
              eventID: eventId,
              ticketDesc: ticket.ticketDesc,
              price: Number(ticket.price),
              kind: ticket.kind,
              owner: ticket.owner.toText(),
              valid: ticket.valid,
            }))
          );
          console.log(parsed);
          setAllMarketplaceTickets(parsed);
        } else {
          setIsVerified(false);
        }
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAndFetchData();
    fetchTickets();
  }, [isAuthenticated, principal]);

  useMemo(() => {
    let tickets = allMarketplaceTickets;
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      tickets = tickets.filter(ticket => {
        const event = eventsMap.get(ticket.eventID) || mockEvents.find(e => e.eventID === ticket.eventID);
        return event?.eventName.toLowerCase().includes(lowercasedTerm);
      });
    }
    if (maxPrice < 250) {
      tickets = tickets.filter(ticket => ticket.price <= maxPrice);
    }
    if (filterDate) {
      tickets = tickets.filter(ticket => {
        const event = eventsMap.get(ticket.eventID) || mockEvents.find(e => e.eventID === ticket.eventID);
        const eventDate = event ? new Date(Number(event.date) / 1000000 || event.eventDate).toISOString().split('T')[0] : '';
        return eventDate === filterDate;
      });
    }
    if (seatType === 'seated') tickets = tickets.filter(t => t.kind['#Seated']);
    if (seatType === 'seatless') tickets = tickets.filter(t => t.kind['#Seatless']);

    setFilteredTickets(tickets);
    setCurrentPage(1);
  }, [searchTerm, maxPrice, filterDate, seatType, allMarketplaceTickets, eventsMap]);

  const totalPages = Math.ceil(filteredTickets.length / TICKETS_PER_PAGE);
  const currentTickets = filteredTickets.slice((currentPage - 1) * TICKETS_PER_PAGE, currentPage * TICKETS_PER_PAGE);

  const handleResetFilters = () => {
    setSearchTerm('');
    setMaxPrice(250);
    setFilterDate('');
    setSeatType('all');
  };

  const handleBuyTicket = async (ticket) => {
    setPurchasedTicket(ticket);
    const ticketActor = createActor(canisterId, {
      agentOptions: { identity: authClient.getIdentity() }
    });
    try{
      setIsLoading(true);
      await ticketActor.transferTicket(ticket, authClient.getIdentity().getPrincipal());
    }
    catch (error) {
      console.error("Failed to transfer ticket:", error);
    }
    finally{
      setIsLoading(false);
    }
    // const identity = authClient ? authClient.getIdentity() : null;
    // const principal = identity ? identity.getPrincipal() : null;
    // console.log(principal);
    // Ticket_backend.transferTicket(ticket, principal);
    setBuyModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-[#11071F]">
        <Loader2 className="h-12 w-12 text-white animate-spin" />
        <p className="ml-4 text-white text-lg">Checking your identity...</p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1e1033] p-8 rounded-lg shadow-2xl shadow-purple-900/50 border border-purple-400/30 text-center max-w-sm w-full">
          <ShieldAlert className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verification Required</h2>
          <p className="text-purple-200/80 mb-6">
            You must verify your identity before accessing the marketplace.
          </p>
          <Button
            size="lg"
            className="w-full bg-purple-600 hover:bg-purple-500"
            onClick={() => navigate('/digiIdentity')}
          >
            Go to Verification
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Ticket Marketplace
            </h1>
            <p className="text-lg text-purple-300/80 mt-2">Discover and purchase verifiable, on-chain tickets.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex-shrink-0">
            <Button onClick={() => navigate('/sell-ticket')}>
              <PlusCircle className="mr-2 h-5 w-5" /> Sell a Ticket
            </Button>
          </div>
        </header>

        <Card className="bg-white/5 border-purple-400/20 p-4 mb-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="search">Search Event</Label>
              <Input
                id="search"
                placeholder="e.g., Web3 Summit"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/20 border-purple-400/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Max Price ({maxPrice} ICP)</Label>
              <Input
                id="price"
                type="range"
                min="0"
                max="250"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-purple-900/50 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Event Date</Label>
              <Input
                id="date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-black/20 border-purple-400/30"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={seatType === 'seated' ? 'secondary' : 'outline'}
                onClick={() => setSeatType('seated')}
                className="flex-1"
              >
                Seated
              </Button>
              <Button
                variant={seatType === 'seatless' ? 'secondary' : 'outline'}
                onClick={() => setSeatType('seatless')}
                className="flex-1"
              >
                Seatless
              </Button>
            </div>
          </div>
          <div className="text-center mt-4">
            <Button variant="ghost" onClick={handleResetFilters} className="text-purple-300/70 hover:text-white">
              <FilterX className="mr-2 h-4 w-4" /> Reset All Filters
            </Button>
          </div>
        </Card>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentTickets.map(ticket => {
              const event = eventsMap.get(ticket.eventID) || mockEvents.find(e => e.eventID === ticket.eventID);
              if (!event) return null;
              return (
                <Card
                  key={ticket.ticketID}
                  className="bg-white/5 border border-purple-400/20 flex flex-col group h-full"
                >
                  <CardHeader>
                    <CardTitle>{event.name || event.eventName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(Number(event.date) / 1000000 || event.eventDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <div className="flex items-center gap-2 text-xl font-bold">
                      <Tag className="h-5 w-5" /> {ticket.price} ICP
                    </div>
                    <div className="flex items-center gap-2 text-xs truncate">
                      <User className="h-4 w-4" /> Owner: {ticket.owner || 'N/A'}
                    </div>
                    {ticket.kind['#Seated'] && (
                      <div className="flex items-center gap-2 text-sm">
                        <Armchair className="h-4 w-4" /> {ticket.kind['#Seated'].seatInfo || 'Seated'}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      className="w-full sm:flex-1"
                      variant="outline"
                      asChild
                    >
                      <Link to={`/tickets/${ticket.ticketID}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button
                      className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleBuyTicket(ticket)}
                    >
                      Buy Now
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {filteredTickets.length > TICKETS_PER_PAGE && (
            <div className="flex items-center justify-center mt-8 space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <span className="font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </main>

        {/* Purchase Success Modal */}
        <Dialog open={buyModalOpen} onOpenChange={setBuyModalOpen}>
          <DialogContent className="bg-[#11071F] text-white border-purple-400/20">
            <DialogHeader>
              <DialogTitle className="text-purple-300 text-2xl">
                Ticket Purchased Successfully!
              </DialogTitle>
              <DialogDescription className="text-purple-300/70">
                You have successfully purchased the "{purchasedTicket?.ticketDesc}" ticket for "
                {(eventsMap.get(purchasedTicket?.eventID) || mockEvents.find(e => e.eventID === purchasedTicket?.eventID))?.name || 'Event'}".
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setBuyModalOpen(false)}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> Back to Marketplace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}