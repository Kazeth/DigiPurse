import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Ticket as TicketIcon, QrCode, User, Tag, CheckCircle, XCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- MOCK DATA BASED ON YOUR MOTOKO TYPES ---
const MOCK_USER_PRINCIPAL = "a4gq6-oaaaa-aaaab-qaa4q-cai"; // Example principal

const mockUserProfile = {
  userID: MOCK_USER_PRINCIPAL,
  username: 'Mismoela',
};

const mockEvents = [
  {
    eventID: "ICP2025",
    organizer: "another-principal-id",
    eventName: "ICP Hackathon 2025",
    eventDescription: "A global hackathon for developers building on the Internet Computer Protocol. Join us for a week of innovation, collaboration, and building the future of the decentralized web.",
    eventDate: new Date('2025-08-01T09:00:00'),
  },
  {
    eventID: "WEB3SUMMIT",
    organizer: MOCK_USER_PRINCIPAL,
    eventName: "Web3 Summit",
    eventDescription: "The premier conference for Web3 and blockchain enthusiasts. Featuring talks from industry leaders, hands-on workshops, and networking opportunities.",
    eventDate: new Date('2025-09-15T10:00:00'),
  },
];

const mockTickets = [
  {
    ticketID: "ICP2025-001",
    eventID: "ICP2025",
    owner: MOCK_USER_PRINCIPAL,
    price: 50,
    kind: { '#Seated': { seatInfo: "Section A, Row 5, Seat 12" } },
    isValid: true,
  },
  {
    ticketID: "WEB3-2025-003",
    eventID: "WEB3SUMMIT",
    owner: MOCK_USER_PRINCIPAL,
    price: 95,
    kind: { '#Seatless': null },
    isValid: false, // This ticket is invalid/used
  },
];

// --- QR Code Component ---
function QRCode({ value, size = 128 }) {
  return <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(value)}&size=${size}x${size}&bgcolor=11071F&color=FFFFFF&qzone=1`} alt="QR Code" width={size} height={size} />;
}

export default function DigiTicketPage() {
  const [user, setUser] = useState(mockUserProfile);
  const [myTickets, setMyTickets] = useState(mockTickets.filter(t => t.owner === user.userID));
  const [selectedTicket, setSelectedTicket] = useState(myTickets[0] || null);

  const getEventForTicket = (ticket) => mockEvents.find(e => e.eventID === ticket.eventID);

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">My Tickets</h1>
            <p className="text-lg text-purple-300/80 mt-1">Manage your event access and ownership.</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Ticket List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Your Tickets ({myTickets.length})</h2>

            <div className="space-y-4 h-[60vh] overflow-y-auto pr-2">
              {myTickets.map(ticket => {
                const event = getEventForTicket(ticket);
                return (
                  <Card 
                    key={ticket.ticketID} 
                    className={cn(
                        "cursor-pointer bg-white/5 border border-purple-400/20 hover:border-purple-400/50 transition-all",
                        selectedTicket?.ticketID === ticket.ticketID && "border-purple-400/80"
                    )}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">{event.eventName}</p>
                        <p className="text-sm text-purple-300/80">{event.eventDate.toLocaleDateString()}</p>
                      </div>
                      {ticket.isValid ? <CheckCircle className="h-6 w-6 text-green-400" /> : <XCircle className="h-6 w-6 text-red-400" />}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="bg-white/5 border-purple-400/20 h-full">
                <CardHeader>
                  <CardTitle className="text-3xl">{getEventForTicket(selectedTicket).eventName}</CardTitle>
                  <CardDescription className="text-purple-300/80">{getEventForTicket(selectedTicket).eventDescription}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code and Details */}
                  <div className="flex flex-col items-center justify-center bg-black/20 p-6 rounded-lg">
                    <QRCode value={selectedTicket.ticketID} size={160} />
                    <p className="mt-4 text-xs text-purple-300/70 tracking-widest">{selectedTicket.ticketID}</p>
                  </div>
                  {/* Info Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-purple-400" />
                      <span>{getEventForTicket(selectedTicket).eventDate.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-purple-400" />
                      <span>Owner: You</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-purple-400" />
                      <span>Original Price: {selectedTicket.price} ICP</span>
                    </div>
                    {selectedTicket.kind['#Seated'] && (
                        <div className="flex items-center gap-3">
                            <TicketIcon className="h-5 w-5 text-purple-400" />
                            <span>Seat: {selectedTicket.kind['#Seated'].seatInfo}</span>
                        </div>
                    )}
                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-purple-400/20 space-y-2">
                         <Link to="/sell-ticket">
                            <Button className="w-full">Sell on Marketplace</Button>
                         </Link>
                         <Button className="w-full" variant="outline">Transfer Ownership</Button>
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
