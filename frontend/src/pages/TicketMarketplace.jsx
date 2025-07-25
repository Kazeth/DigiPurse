import React, { useState, useEffect, useMemo } from 'react';
import { MasterTicket_backend } from 'declarations/MasterTicket_backend';
import { Event_backend } from 'declarations/Event_backend';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Tag, Search, FilterX, ArrowLeft, ArrowRight, Armchair, User, PlusCircle, Loader2, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../lib/AuthContext';
import { Identity_backend } from 'declarations/Identity_backend';
import { cn } from '@/lib/utils';

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
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(250);
  const [filterDate, setFilterDate] = useState('');
  const [seatType, setSeatType] = useState('all');

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

          const response = await MasterTicket_backend.getAllMasterTicket();
          const parsed = response.map(([id, masterTicket]) => ({
            ticketID: id,
            eventID: masterTicket.eventID,
            ticketDesc: masterTicket.ticketDesc,
            price: Number(masterTicket.price),
            kind: masterTicket.kind,
            valid: masterTicket.valid,
          }));
          setAllMarketplaceTickets(parsed);

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

    checkAndFetchData();
  }, [isAuthenticated, principal]);

  useMemo(() => {
    let tickets = allMarketplaceTickets;
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      tickets = tickets.filter(ticket => {
        const event = mockEvents.find(e => e.eventID === ticket.eventID);
        return event?.eventName.toLowerCase().includes(lowercasedTerm);
      });
    }
    if (maxPrice < 250) {
      tickets = tickets.filter(ticket => ticket.price <= maxPrice);
    }
    if (filterDate) {
      tickets = tickets.filter(ticket => {
        const event = mockEvents.find(e => e.eventID === ticket.eventID);
        return event?.eventDate.toISOString().split('T')[0] === filterDate;
      });
    }
    if (seatType === 'seated') tickets = tickets.filter(t => t.kind['#Seated']);
    if (seatType === 'seatless') tickets = tickets.filter(t => t.kind['#Seatless']);

    setFilteredTickets(tickets);
    setCurrentPage(1);
  }, [searchTerm, maxPrice, filterDate, seatType, allMarketplaceTickets]);

  const totalPages = Math.ceil(filteredTickets.length / TICKETS_PER_PAGE);
  const currentTickets = filteredTickets.slice((currentPage - 1) * TICKETS_PER_PAGE, currentPage * TICKETS_PER_PAGE);

  const handleResetFilters = () => {
    setSearchTerm('');
    setMaxPrice(250);
    setFilterDate('');
    setSeatType('all');
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

        {/* Filters Bar */}
        <Card className="bg-white/5 border-purple-400/20 p-4 mb-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="search">Search Event</Label>
              <Input id="search" placeholder="e.g., Web3 Summit" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/20 border-purple-400/30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Max Price ({maxPrice} ICP)</Label>
              <Input id="price" type="range" min="0" max="250" step="5" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-2 bg-purple-900/50 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Event Date</Label>
              <Input id="date" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-black/20 border-purple-400/30" />
            </div>
            <div className="flex gap-2">
              <Button variant={seatType === 'seated' ? 'secondary' : 'outline'} onClick={() => setSeatType('seated')} className="flex-1">Seated</Button>
              <Button variant={seatType === 'seatless' ? 'secondary' : 'outline'} onClick={() => setSeatType('seatless')} className="flex-1">Seatless</Button>
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
            {currentTickets.length > 0 ? currentTickets.map(ticket => {
              const event = mockEvents.find(e => e.eventID === ticket.eventID);
              return (
                <Link key={ticket.ticketID} to={`/events/${ticket.eventID}?from=marketplace&ticketID=${ticket.ticketID}`}>
                  <Card className="bg-white/5 border border-purple-400/20 flex flex-col group hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300 transform hover:-translate-y-1 h-full">
                    <CardHeader>
                      <CardTitle className="text-white group-hover:text-purple-300 transition-colors">{event?.eventName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 pt-1 text-purple-300/70">
                        <Calendar className="h-4 w-4" /> {event?.eventDate.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                      <div className="flex items-center gap-2 text-xl font-bold text-purple-300">
                        <Tag className="h-5 w-5" /> {ticket.price} ICP
                      </div>
                      <div className="flex items-center gap-2 text-xs text-purple-400/80 truncate">
                        <User className="h-4 w-4" /> Owner: {ticket.owner ? ticket.owner.toText() : 'N/A'}
                      </div>
                      {ticket.kind['#Seated'] && (
                        <div className="flex items-center gap-2 text-sm text-purple-400">
                          <Armchair className="h-4 w-4" /> {ticket.kind['#Seated'].seatInfo}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-purple-600 hover:bg-purple-500">View Details</Button>
                    </CardFooter>
                  </Card>
                </Link>
              );
            }) : (
              <p className="text-center col-span-full text-purple-300/80 text-lg">No tickets found in the marketplace.</p>
            )}
          </div>

          {filteredTickets.length > TICKETS_PER_PAGE && (
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
          )}
        </main>
      </div>
    </div>
  );
}
