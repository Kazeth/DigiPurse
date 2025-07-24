import React from 'react';
import { useParams, useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Tag, Users, Ticket, Armchair, User, ArrowLeft } from 'lucide-react';

// --- MOCK DATA (Updated to match Motoko types) ---
const mockEvents = [
  { id: "ICP2025", name: "ICP Hackathon 2025", date: new Date('2025-08-01T09:00:00'), organizer: 'org-principal-123', description: 'A global hackathon for developers building on the Internet Computer Protocol.', image: 'https://placehold.co/1200x400/1E0A2E/FFFFFF?text=ICP+Hackathon', ticketSupply: 500, ticketsSold: 150 },
  { id: "WEB3SUMMIT", name: "Web3 Summit", date: new Date('2025-09-15T10:00:00'), organizer: 'org-principal-456', description: 'The premier conference for Web3 and blockchain enthusiasts.', image: 'https://placehold.co/1200x400/1E0A2E/FFFFFF?text=Web3+Summit', ticketSupply: 1000, ticketsSold: 850 },
];

const mockMarketplaceTickets = [
    { id: "WEB3-001", eventID: "WEB3SUMMIT", owner: "user-abc-...", price: 120, kind: { '#Seatless': null }, valid: true },
    { id: "WEB3-002", eventID: "WEB3SUMMIT", owner: "user-def-...", price: 150, kind: { '#Seated': { seatInfo: "Section B, Row 10, Seat 5" } }, valid: true },
    { id: "ICP-001", eventID: "ICP2025", owner: "user-xyz-...", price: 75, kind: { '#Seatless': null }, valid: true },
];

const mockOfficialTickets = [
    { id: "WEB3-ORG-01", eventID: "WEB3SUMMIT", price: 100, kind: { '#Seatless': { name: "General Admission" } } },
    { id: "WEB3-ORG-02", eventID: "WEB3SUMMIT", price: 250, kind: { '#Seated': { name: "VIP Seating" } } },
    { id: "ICP-ORG-01", eventID: "ICP2025", price: 60, kind: { '#Seatless': { name: "Early Bird Pass" } } },
];
// --- END MOCK DATA ---

export default function EventDetailPage() {
  const { eventID } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const fromMarketplace = searchParams.get('from') === 'marketplace';
  const marketplaceTicketID = searchParams.get('ticketID');

  const location = useLocation();
  const { event } = location.state || {};
  console.log(event)
  
  const marketplaceTicket = fromMarketplace 
    ? mockMarketplaceTickets.find(t => t.id === marketplaceTicketID) 
    : null;

  const officialTicketTypes = mockOfficialTickets.filter(t => t.eventID === eventID);

  if (!event) {
    return <div className="text-center p-12">Event not found.</div>;
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] text-white">
      <div className="h-64 md:h-80 bg-cover bg-center relative" style={{ backgroundImage: `url(${event.image})` }}>
        <div className="absolute inset-0 bg-black/60 flex items-end p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold">{event.eventName}</h1>
            </div>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Link to={fromMarketplace ? "/marketplace" : "/events"} className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to {fromMarketplace ? "Marketplace" : "Events"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Event Details */}
            <div className="lg:col-span-1">
                <Card className="bg-white/5 border-purple-400/20 sticky top-24">
                    <CardHeader><CardTitle className="text-2xl">Event Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-purple-300/80">
                        <p>{event.eventDesc}</p>
                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-purple-400" /><span>{event.eventDate.toLocaleString()}</span></div>
                        <div className="flex items-center gap-3"><User className="h-5 w-5 text-purple-400" /><span>OrganizerID: {event.organizerID}</span></div>
                        <div className="flex items-center gap-3"><Users className="h-5 w-5 text-purple-400" /><span>{Number(event.ticketCount)} Tickets Left</span></div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Ticket Listings */}
            <div className="lg:col-span-2">
                {fromMarketplace && marketplaceTicket ? (
                    <>
                        <h2 className="text-3xl font-bold mb-4">Marketplace Listing</h2>
                        <Card className="bg-white/10 border-purple-400/30">
                            <CardHeader>
                                <CardTitle className="text-2xl">{'#Seated' in marketplaceTicket.kind ? `Seated: ${marketplaceTicket.kind['#Seated'].seatInfo}` : 'General Admission'}</CardTitle>
                                <CardDescription className="text-purple-300/70">Ticket ID: {'ticket id'}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3"><User className="h-5 w-5 text-purple-400" /><span>Seller: {marketplaceTicket.owner}</span></div>
                                <div className="flex items-center gap-3 text-3xl font-bold"><Tag className="h-7 w-7 text-purple-400" /><span>{marketplaceTicket.price} ICP</span></div>
                                <Button size="lg" className="w-full mt-4">Buy From User</Button>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold mb-4">Buy Official Tickets</h2>
                        <div className="space-y-4">
                            {officialTicketTypes.map(ticket => (
                                <Card key={ticket.id} className="bg-white/10 border-purple-400/30 flex justify-between items-center p-4">
                                    <div>
                                        <p className="font-bold">{'#Seated' in ticket.kind ? ticket.kind['#Seated'].name : ticket.kind['#Seatless'].name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold">{ticket.price} ICP</p>
                                        <Button size="sm" className="mt-1">Buy Now</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
