import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Ticket as TicketIcon, User, Tag, CheckCircle, XCircle, Users, Store, Trash2, PanelLeftClose, PanelLeftOpen, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

const MOCK_USER_PRINCIPAL = "a4gq6-oaaaa-aaaab-qaa4q-cai";

const mockEvents = [
  {
    id: "ICP2025",
    organizer: "another-principal-id",
    name: "ICP Hackathon 2025",
    description: "A global hackathon for developers building on the Internet Computer Protocol. Join us for a week of innovation, collaboration, and building the future of the decentralized web.",
    date: new Date('2025-08-01T09:00:00'),
  },
  {
    id: "WEB3SUMMIT",
    organizer: MOCK_USER_PRINCIPAL,
    name: "Web3 Summit",
    description: "The premier conference for Web3 and blockchain enthusiasts. Featuring talks from industry leaders, hands-on workshops, and networking opportunities.",
    date: new Date('2025-09-15T10:00:00'),
  },
];

const mockUserTickets = [
  {
    id: "ICP2025-001",
    eventID: "ICP2025",
    owner: MOCK_USER_PRINCIPAL,
    price: 50,
    kind: { '#Seated': { seatInfo: "Section A, Row 5, Seat 12" } },
    valid: true,
    forSale: false,
  },
  {
    id: "WEB3-2025-003",
    eventID: "WEB3SUMMIT",
    owner: MOCK_USER_PRINCIPAL,
    price: 95,
    kind: { '#Seatless': null },
    valid: true,
    forSale: true,
  },
  {
    id: "WEB3-2025-004",
    eventID: "WEB3SUMMIT",
    owner: MOCK_USER_PRINCIPAL,
    price: 110,
    kind: { '#Seatless': null },
    valid: false,
    forSale: false,
  },
];

export default function DigiTicketPage() {
  const navigate = useNavigate();
  const [myTickets, setMyTickets] = useState(mockUserTickets);
  const [selectedTicket, setSelectedTicket] = useState(myTickets[0] || null);
  const [isListVisible, setIsListVisible] = useState(true);
  const [isTicketIdVisible, setIsTicketIdVisible] = useState(false);

  const location = useLocation();
  useEffect(() => {
    const newTicket = location.state?.newTicket;
    if (newTicket) {
      setMyTickets(prev => [...prev, newTicket]);
      setSelectedTicket(newTicket);
    }
  }, [location.state]);

  const getEventForTicket = (ticket) => {
    if (!ticket) return null;
    return mockEvents.find(e => e.id === ticket.eventID);
  };

  const handleCancelListing = (ticketId) => {
    setMyTickets(currentTickets =>
      currentTickets.map(t =>
        t.id === ticketId ? { ...t, forSale: false } : t
      )
    );
    setSelectedTicket(prev => (prev?.id === ticketId ? { ...prev, forSale: false } : prev));
    console.log(`Ticket ${ticketId} removed from marketplace.`);
  };

  useEffect(() => {
    setIsTicketIdVisible(false);
  }, [selectedTicket]);

  const selectedEvent = getEventForTicket(selectedTicket);

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">My Tickets</h1>
            <p className="text-lg text-purple-300/80 mt-1">Manage your event access and ownership.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {isListVisible && (
            <div className="lg:col-span-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Tickets ({myTickets.length})</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsListVisible(false)} className="text-purple-300/70 hover:text-white">
                  <PanelLeftClose />
                </Button>
              </div>
              <div className="space-y-4 h-[60vh] overflow-y-auto pr-2">
                {myTickets.map(ticket => {
                  const event = getEventForTicket(ticket);
                  return (
                    <Card
                      key={ticket.id}
                      className={cn(
                        "cursor-pointer bg-white/5 border border-purple-400/20 hover:border-purple-400/50 transition-all",
                        selectedTicket?.id === ticket.id && "border-purple-400/80 ring-2 ring-purple-400"
                      )}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-lg">{event?.name}</p>
                          <p className="text-sm text-purple-300/80">{event?.date.toLocaleDateString()}</p>
                        </div>
                        {ticket.forSale ? (
                          <Store className="h-6 w-6 text-yellow-400" />
                        ) : (
                          ticket.valid ? <CheckCircle className="h-6 w-6 text-green-400" /> : <XCircle className="h-6 w-6 text-red-400" />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div className={cn("transition-all duration-300", isListVisible ? "lg:col-span-2" : "lg:col-span-3")}>
            {!isListVisible && (
              <Button variant="ghost" onClick={() => setIsListVisible(true)} className="mb-4 text-purple-300/70 hover:text-white">
                <PanelLeftOpen className="mr-2" /> Show Ticket List
              </Button>
            )}
            {selectedTicket && selectedEvent ? (
              <Card className="bg-white/5 border-purple-400/20 h-full">
                <CardHeader>
                  <CardTitle className="text-3xl">{selectedEvent.name}</CardTitle>
                  <CardDescription className="text-purple-300/80">{selectedEvent.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center justify-center bg-black/20 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm text-purple-300/70">TICKET ID</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-purple-300/70 hover:text-white" onClick={() => setIsTicketIdVisible(!isTicketIdVisible)}>
                        {isTicketIdVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-2xl font-bold tracking-widest text-center break-all">
                      {isTicketIdVisible ? selectedTicket.id : '••••••••••••••••'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-purple-400" /><span>{selectedEvent.date.toLocaleString()}</span></div>
                    <div className="flex items-center gap-3"><Users className="h-5 w-5 text-purple-400" /><span>Owner: You</span></div>
                    <div className="flex items-center gap-3"><Tag className="h-5 w-5 text-purple-400" /><span>Original Price: {selectedTicket.price} ICP</span></div>
                    {'#Seated' in selectedTicket.kind && (
                      <div className="flex items-center gap-3">
                        <TicketIcon className="h-5 w-5 text-purple-400" />
                        <span>Seat: {selectedTicket.kind['#Seated'].seatInfo}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-purple-400/20 space-y-2">
                      {selectedTicket.forSale ? (
                        <Button className="w-full" variant="destructive" onClick={() => handleCancelListing(selectedTicket.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Cancel Marketplace Listing
                        </Button>
                      ) : (
                        selectedTicket.valid ? (
                          <Button className="w-full" onClick={() => navigate('/sell-ticket')}>
                            <Store className="mr-2 h-4 w-4" /> Sell on Marketplace
                          </Button>
                        ) : (
                          <p className="text-center text-red-400 font-semibold p-2 bg-red-900/20 rounded-md">This ticket has been used.</p>
                        )
                      )}
                      <Button className="w-full" variant="outline" disabled={!selectedTicket.valid}>Transfer Ownership</Button>
                      <Link to={`/events/${selectedTicket.eventID}`}>
                        <Button className="w-full" variant="ghost">View Event Details</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full bg-white/5 border-2 border-dashed border-purple-400/20 rounded-lg">
                <p className="text-purple-300/70">Select a ticket to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
