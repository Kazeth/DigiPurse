import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Tag, User, Armchair, MapPin, ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Identity_backend } from 'declarations/Identity_backend';
import { createActor as createTicketActor, canisterId as ticketCanisterId } from '@/declarations/Ticket_backend';
import { createActor as createEventActor, canisterId as eventCanisterId } from '@/declarations/Event_backend';
// Assuming you will have a Ticket_backend declaration
// import { Ticket_backend } from 'declarations/Ticket_backend';

// --- MOCK DATA ---
const mockTickets = [
  { ticketID: 'TKT-1', eventID: 'EVT-001', ticketDesc: 'General Admission', price: 50, kind: { '#Seatless': null }, owner: 'mock-principal-1', valid: true },
  { ticketID: 'TKT-2', eventID: 'WEB3SUMMIT', ticketDesc: 'VIP', price: 100, kind: { '#Seated': { seatInfo: 'Section A, Row 1' } }, owner: 'mock-principal-2', valid: true },
  { ticketID: 'TKT-3', eventID: 'DEVFEST', ticketDesc: 'Standard', price: 70, kind: { '#Seatless': null }, owner: 'mock-principal-3', valid: false },
];

const mockEvents = [
  { eventID: 'EVT-001', name: 'ICP Hackathon 2025', date: new Date('2025-08-01T09:00:00').getTime() * 1000000, location: 'Virtual', description: 'A global hackathon for blockchain developers.', image: 'https://placehold.co/1200x400/1E0A2E/FFFFFF?text=ICP+Hackathon' },
  { eventID: 'WEB3SUMMIT', name: 'Web3 Summit', date: new Date('2025-09-15T10:00:00').getTime() * 1000000, location: 'San Francisco, CA', description: 'Explore the future of decentralized technologies.', image: 'https://placehold.co/1200x400/1E0A2E/FFFFFF?text=Web3+Summit' },
  { eventID: 'DEVFEST', name: 'DevFest Global', date: new Date('2025-10-20T11:00:00').getTime() * 1000000, location: 'London, UK', description: 'A developer festival with workshops and talks.', image: 'https://placehold.co/1200x400/1E0A2E/FFFFFF?text=DevFest' },
];
// --- END MOCK DATA ---

export default function TicketDetailsPage() {
  const { ticketID } = useParams();
  const navigate = useNavigate();
  const { authClient, isAuthenticated, principal } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !principal) {
        // In a real app, a protected route would handle this, but this is a safeguard.
        navigate('/login');
        return;
      }
      setIsLoading(true);
      try {
        const identityOpt = await Identity_backend.getIdentity(principal);
        if (identityOpt.length > 0 && identityOpt[0].isVerified) {
          setIsVerified(true);
          // In a real app, you would fetch the ticket from your Ticket_backend
          const ticketData = await getTicketData();
          if (ticketData) {
            setTicket(ticketData);
          }
          if (!ticketData) {
            throw new Error('Ticket not found.');
          }
          // In a real app, you would fetch the event from your Event_backend
          const eventActor = createEventActor(eventCanisterId, {
            agentOptions: { identity: authClient.getIdentity() }
          });
          const eventData = await eventActor.getEventByEventId(ticketData.eventID);
          if (!eventData) throw new Error('Event for this ticket not found.');
          setEvent(eventData);

        } else {
          setIsVerified(false);
        }
      } catch (err) {
        setError(err.message || 'Failed to load ticket details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ticketID, isAuthenticated, principal, navigate]);

  const getTicketData = async () => {
    const ticketActor = createTicketActor(ticketCanisterId, {
      agentOptions: { identity: authClient.getIdentity() }
    });
    const allUserTicket = await ticketActor.getAllUserTicket(principal);
    const allOnSaleTicket = await ticketActor.getAllOnSaleTicket();
    for (const ticket of allUserTicket) {
      // console.log(ticket[1][0].ticketID);
      if (ticket[1][0].ticketID == ticketID) {
        const tData = ticket[1][0];
        console.log(tData);
        return tData;
      }
    }
    for (const ticket of allOnSaleTicket) {
      // console.log(ticket[1][0].ticketID);
      if (ticket[1][0].ticketID == ticketID) {
        const tData = ticket[1][0];
        console.log(tData);
        return tData;
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-[#11071F]">
        <Loader2 className="h-12 w-12 text-white animate-spin" />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="bg-[#1e1033] p-8 rounded-lg shadow-2xl shadow-purple-900/50 border border-purple-400/30 text-center max-w-sm w-full">
          <CardHeader>
            <ShieldAlert className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
            <CardTitle className="text-2xl font-bold text-white">Verification Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-200/80 mb-6">You must verify your identity to view ticket details.</p>
            <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-500" onClick={() => navigate('/digiidentity')}>
              Go to Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !ticket || !event) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-[#11071F] text-white p-4">
        <p>{error || "Ticket or event data could not be loaded."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] text-white">
      {/* Event Hero Image */}
      <div className="h-64 md:h-80 bg-cover bg-center relative" style={{ backgroundImage: `url(${event.image})` }}>
        <div className="absolute inset-0 bg-black/60 flex items-end p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold">{event.name}</h1>
            </div>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Event Details */}
            <div className="lg:col-span-1">
                <Card className="bg-white/5 border-purple-400/20 sticky top-24">
                    <CardHeader><CardTitle className="text-2xl text-purple-300">Event Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-purple-300/80">
                        <p>{event.description}</p>
                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-purple-400" /><span>{new Date(Number(event.date) / 1000000).toLocaleString()}</span></div>
                        <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-purple-400" /><span>{event.location}</span></div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Ticket Details */}
            <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-4">Marketplace Listing</h2>
                <Card className="bg-white/10 border-purple-400/30">
                    <CardHeader>
                        <CardTitle className="text-2xl">{ticket.ticketDesc}</CardTitle>
                        <CardDescription className="text-purple-300/70">Ticket ID: {ticket.ticketID}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3"><User className="h-5 w-5 text-purple-400" /><span><strong>Seller:</strong> <span className="truncate">{ticket.owner.toString()}</span></span></div>
                        <div className="flex items-center gap-3"><Tag className="h-5 w-5 text-purple-400" /><span><strong>Price:</strong> {ticket.price} ICP</span></div>
                        {ticket.kind['#Seated'] && (
                            <div className="flex items-center gap-3"><Armchair className="h-5 w-5 text-purple-400" /><span><strong>Seat:</strong> {ticket.kind['#Seated'].seatInfo}</span></div>
                        )}
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="h-5 w-5 text-purple-400" />
                            <span><strong>Status:</strong> <span className={ticket.valid ? "text-green-400" : "text-red-400"}>{ticket.valid ? 'Valid for Entry' : 'Used / Invalid'}</span></span>
                        </div>
                        <div className="pt-4 border-t border-purple-400/20">
                            <Button size="lg" className="w-full" disabled={!ticket.valid}>Buy Ticket</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
