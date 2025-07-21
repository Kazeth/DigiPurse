import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Tag, Users, Ticket, Armchair, User, ArrowLeft } from 'lucide-react';

// --- MOCK DATA (You would fetch this based on the eventID from the URL) ---
const mockEvents = [
  { eventID: "ICP2025", eventName: "ICP Hackathon 2025", eventDate: new Date('2025-08-01T09:00:00'), organizer: 'org-principal-123', description: 'A global hackathon for developers building on the Internet Computer Protocol.', image: 'https://placehold.co/1200x400/1E0A2E/FFFFFF?text=ICP+Hackathon', ticketSupply: 500, ticketsSold: 150 },
  { eventID: "WEB3SUMMIT", eventName: "Web3 Summit", eventDate: new Date('2025-09-15T10:00:00'), organizer: 'org-principal-456', description: 'The premier conference for Web3 and blockchain enthusiasts.', image: 'https://placehold.co/1200x400/1E0A2E/FFFFFF?text=Web3+Summit', ticketSupply: 1000, ticketsSold: 850 },
];

const mockMarketplaceTickets = [
    { ticketID: "WEB3-001", eventID: "WEB3SUMMIT", owner: "user-abc", price: 120, kind: { '#Seatless': null } },
    { ticketID: "WEB3-002", eventID: "WEB3SUMMIT", owner: "user-def", price: 150, kind: { '#Seated': { seatInfo: "A5" } } },
    { ticketID: "ICP-001", eventID: "ICP2025", owner: "user-xyz", price: 75, kind: { '#Seatless': null } },
];
// --- END MOCK DATA ---

export default function EventDetailPage() {
  const { eventID } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // FIX: Initialize the navigate hook
  const cameFromMarketplace = searchParams.get('from') === 'marketplace';

  // In a real app, you would fetch this data from your backend using the eventID
  const event = mockEvents.find(e => e.eventID === eventID);
  const ticketsForSale = mockMarketplaceTickets.filter(t => t.eventID === eventID);

  if (!event) {
    return <div className="text-center p-12">Event not found.</div>;
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] text-white">
      {/* Event Hero Image */}
      <div className="h-64 md:h-80 bg-cover bg-center relative" style={{ backgroundImage: `url(${event.image})` }}>
        <div className="absolute inset-0 bg-black/60 flex items-end p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold">{event.eventName}</h1>
            </div>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Link to={cameFromMarketplace ? "/marketplace" : "/events"} className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to {cameFromMarketplace ? "Marketplace" : "Events"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Event Details */}
            <div className="lg:col-span-1">
                <Card className="bg-white/5 border-purple-400/20 sticky top-24">
                    <CardHeader>
                        <CardTitle className="text-2xl">Event Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-purple-300/80">
                        <p>{event.description}</p>
                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-purple-400" /><span>{event.eventDate.toLocaleString()}</span></div>
                        <div className="flex items-center gap-3"><User className="h-5 w-5 text-purple-400" /><span>Organizer: {event.organizer.substring(0, 15)}...</span></div>
                        
                        {/* --- CONDITIONAL INFO --- */}
                        {cameFromMarketplace ? (
                            <div className="flex items-center gap-3"><Ticket className="h-5 w-5 text-purple-400" /><span>{ticketsForSale.length} tickets on Marketplace</span></div>
                        ) : (
                            <div className="flex items-center gap-3"><Users className="h-5 w-5 text-purple-400" /><span>{event.ticketSupply - event.ticketsSold} / {event.ticketSupply} Tickets Left</span></div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Ticket Listings */}
            <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-4">{cameFromMarketplace ? "Available for Purchase" : "Official Tickets"}</h2>
                <div className="space-y-4">
                    {/* --- CONDITIONAL TICKET DISPLAY --- */}
                    {cameFromMarketplace ? (
                        ticketsForSale.map(ticket => (
                            <Card key={ticket.ticketID} className="bg-white/10 border-purple-400/30 flex justify-between items-center p-4">
                                <div>
                                    <p className="font-bold">{ticket.kind['#Seated'] ? `Seated: ${ticket.kind['#Seated'].seatInfo}` : 'General Admission'}</p>
                                    <p className="text-xs text-purple-300/70">Owner: {ticket.owner}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold">{ticket.price} ICP</p>
                                    <Button size="sm" className="mt-1">Buy Now</Button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="bg-white/10 border-purple-400/30 p-6 text-center">
                            <p className="text-purple-300/80">This is the official event page. Tickets can be purchased directly from the organizer or on the marketplace.</p>
                            <div className="mt-4 space-x-4">
                                <Button>Buy from Organizer</Button>
                                <Button variant="outline" onClick={() => navigate('/marketplace')}>Go to Marketplace</Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
