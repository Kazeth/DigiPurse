import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Tag, CheckCircle, Info, Loader2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../lib/AuthContext';
import { Identity_backend } from 'declarations/Identity_backend';

const MOCK_USER_PRINCIPAL = "a4gq6-oaaaa-aaaab-qaa4q-cai";
const mockEvents = [
  { eventID: "ICP2025", eventName: "ICP Hackathon 2025" },
  { eventID: "WEB3SUMMIT", eventName: "Web3 Summit" },
];
const allUserTickets = [
  { ticketID: "ICP2025-001", eventID: "ICP2025", owner: MOCK_USER_PRINCIPAL, price: 50, forSale: false, kind: { '#Seated': { seatInfo: "A5" } } },
  { ticketID: "WEB3-2025-003", eventID: "WEB3SUMMIT", owner: MOCK_USER_PRINCIPAL, price: 95, forSale: false, kind: { '#Seatless': null } },
  { ticketID: "WEB3-2025-005", eventID: "WEB3SUMMIT", owner: MOCK_USER_PRINCIPAL, price: 150, forSale: true, kind: { '#Seatless': null } },
];

export default function SellTicketPage() {
  const navigate = useNavigate();
  const { isAuthenticated, principal } = useAuth();

  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [sellableTickets, setSellableTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [listingPrice, setListingPrice] = useState('');

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

          const userTickets = allUserTickets;
          const ticketsNotForSale = userTickets.filter(t => !t.forSale && t.owner === principal.toText());
          setSellableTickets(ticketsNotForSale);
          if (ticketsNotForSale.length > 0) {
            setSelectedTicket(ticketsNotForSale[0]);
          }

        } else {
          setIsVerified(false);
        }
      } catch (error) {
        console.error("Failed to check identity or fetch tickets:", error);
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndFetchData();
  }, [isAuthenticated, principal]);

  const getEventForTicket = (ticket) => {
    return mockEvents.find(e => e.eventID === ticket.eventID);
  };

  const handleListTicket = () => {
    if (!selectedTicket || !listingPrice) return;
    console.log(`Listing ticket ${selectedTicket.ticketID} for ${listingPrice} ICP.`);
    alert('Ticket listed successfully!');
    navigate('/marketplace');
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
            You must verify your identity before you can sell a ticket.
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
        <Link to="/digiticket" className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to My Tickets
        </Link>
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Sell Your Ticket</h1>
          <p className="text-lg text-purple-300/80 mt-1">Select a ticket you own and set a price to list it on the marketplace.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Select a Ticket to Sell</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {sellableTickets.length > 0 ? (
                sellableTickets.map(ticket => {
                  const event = getEventForTicket(ticket);
                  if (!event) return null;
                  return (
                    <Card
                      key={ticket.ticketID}
                      className={cn(
                        "cursor-pointer bg-white/5 border border-purple-400/20 hover:border-purple-400/50 transition-all",
                        selectedTicket?.ticketID === ticket.ticketID && "border-purple-400/80 ring-2 ring-purple-400"
                      )}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setListingPrice('');
                      }}
                    >
                      <CardContent className="p-4">
                        <p className="font-bold text-lg">{event.eventName}</p>
                        <p className="text-sm text-purple-300/80">{'#Seated' in ticket.kind ? `Seat: ${ticket.kind['#Seated'].seatInfo}` : 'General Admission'}</p>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-48 bg-white/5 border-2 border-dashed border-purple-400/20 rounded-lg">
                  <p className="text-purple-300/70 text-center">You have no tickets available to sell.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Set Your Price</h2>
            {selectedTicket ? (
              <Card className="bg-white/5 border-purple-400/20">
                <CardHeader>
                  <CardTitle className="text-2xl">{getEventForTicket(selectedTicket)?.eventName}</CardTitle>
                  <CardDescription className="text-purple-300/80">{selectedTicket.ticketID}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="price" className="text-lg">Listing Price (in ICP)</Label>
                    <div className="relative mt-2">
                      <Input
                        id="price"
                        type="number"
                        placeholder="e.g., 100"
                        value={listingPrice}
                        onChange={(e) => setListingPrice(e.target.value)}
                        className="bg-black/20 border-purple-400/30 text-2xl font-bold pl-12 h-14"
                      />
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-purple-300/60" />
                    </div>
                  </div>
                  <div className="!mt-6 p-4 bg-purple-900/20 border border-purple-400/20 rounded-lg flex items-start gap-3">
                    <Info className="h-5 w-5 text-purple-300 flex-shrink-0 mt-1" />
                    <p className="text-sm text-purple-300/80">
                      A small platform fee will be deducted upon successful sale. All listings are final until removed.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleListTicket}
                    disabled={!listingPrice || Number(listingPrice) <= 0}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    List Ticket for Sale
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full bg-white/5 border-2 border-dashed border-purple-400/20 rounded-lg">
                <p className="text-purple-300/70">Please select a ticket from the left to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
