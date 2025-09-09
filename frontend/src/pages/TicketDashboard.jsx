import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Ticket as TicketIcon, Users, Tag, CheckCircle, XCircle, Store, Trash2, PanelLeftClose, PanelLeftOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { createActor as createTicketActor, canisterId as ticketCanisterId } from '@/declarations/Ticket_backend';
import { createActor as createEventActor, canisterId as eventCanisterId } from '@/declarations/Event_backend';

export default function DigiTicketPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authClient } = useAuth();

  // 1. Siapkan state untuk data asli dan status loading
  const [myTickets, setMyTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk UI
  const [isListVisible, setIsListVisible] = useState(true);
  const [isTicketIdVisible, setIsTicketIdVisible] = useState(false);

  // 2. useEffect utama untuk mengambil data dari backend saat komponen dimuat
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!authClient) return;

      setIsLoading(true);
      try {
        // Wait for authClient to be ready and identity to be available
        const identity = await authClient.getIdentity();
        const principal = await identity.getPrincipal();

        // Buat actor untuk ticket dan event
        const ticketActor = createTicketActor(ticketCanisterId, { agentOptions: { identity } });
        const eventActor = createEventActor(eventCanisterId, { agentOptions: { identity } });

        // Ambil semua tiket milik pengguna dan semua event
        const [userTicketsResult, allEventsResult] = await Promise.all([
          await ticketActor.getAllUserTicket(principal),
          await eventActor.getAllEvents()
        ]);

        // 3. Transformasi data tiket dari backend
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
              id: ticket.id ?? ticket.ticketID, // fallback if id not present
              forSale: ticket.forSale ?? ticket.isOnMarketplace, // fallback for compatibility
            }))
        );

        // 4. Transformasi data event dari backend
        const formattedEvents = allEventsResult.map(([id, event]) => ({
          id: event.id,
          name: event.name,
          description: event.description,
          date: new Date(Number(event.date / 1000000n)),
        }));

        setMyTickets(formattedTickets);
        setEvents(formattedEvents);

        // Pilih tiket pertama sebagai default jika ada
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
  }, [authClient]);

  // 5. useEffect untuk menangani tiket baru dari halaman pembelian
  useEffect(() => {
    const newTicketData = location.state?.newTicket;
    if (newTicketData) {
      const { eventDetail, ...ticketOnlyData } = newTicketData;

      // Tambahkan tiket baru hanya jika belum ada
      setMyTickets(prev => {
        if (!prev.some(t => t.id === ticketOnlyData.id)) {
          return [ticketOnlyData, ...prev];
        }
        return prev; // Jika sudah ada, jangan tambahkan
      });

      // Tambahkan detail event baru jika belum ada
      if (eventDetail && !events.some(e => e.id === eventDetail.id)) {
        setEvents(prev => [...prev, eventDetail]);
      }

      // Langsung pilih tiket yang baru
      setSelectedTicket(ticketOnlyData);

      // Hapus state dari URL untuk mencegah duplikasi saat refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, events]);

  // Fungsi untuk mencari detail event dari state 'events'
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

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-bold"
              style={{ fontFamily: 'AeonikBold, sans-serif' }}
            >
              My Tickets
            </h1>
            <p
              className="text-lg text-purple-300/80 mt-1"
              style={{ fontFamily: 'AeonikLight, sans-serif' }}
            >
              Manage your event access and ownership.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {isListVisible && (
            <div className="lg:col-span-1">
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-xl font-semibold"
                  style={{ fontFamily: 'AeonikBold, sans-serif' }}
                >
                  Your Tickets ({myTickets.length})
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsListVisible(false)}
                  className="text-purple-300/70 hover:text-white"
                  style={{ fontFamily: 'AeonikBold, sans-serif' }}
                >
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
                          <p
                            className="font-bold text-lg"
                            style={{ fontFamily: 'AeonikBold, sans-serif' }}
                          >
                            {event?.name}
                          </p>
                          <p
                            className="text-sm text-purple-300/80"
                            style={{ fontFamily: 'AeonikLight, sans-serif' }}
                          >
                            {event?.date.toLocaleDateString()}
                          </p>
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
              <Button
                variant="ghost"
                onClick={() => setIsListVisible(true)}
                className="mb-4 text-purple-300/70 hover:text-white"
                style={{ fontFamily: 'AeonikBold, sans-serif' }}
              >
                <PanelLeftOpen className="mr-2" /> Show Ticket List
              </Button>
            )}
            {selectedTicket && selectedEvent ? (
              <Card className="bg-white/5 border-purple-400/20 h-full">
                <CardHeader>
                  <CardTitle
                    className="text-3xl"
                    style={{ fontFamily: 'AeonikBold, sans-serif' }}
                  >
                    {selectedEvent.name}
                  </CardTitle>
                  <CardDescription
                    className="text-purple-300/80"
                    style={{ fontFamily: 'AeonikLight, sans-serif' }}
                  >
                    {selectedEvent.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center justify-center bg-black/20 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <p
                        className="text-sm text-purple-300/70"
                        style={{ fontFamily: 'AeonikLight, sans-serif' }}
                      >
                        TICKET ID
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-purple-300/70 hover:text-white"
                        onClick={() => setIsTicketIdVisible(!isTicketIdVisible)}
                        style={{ fontFamily: 'AeonikBold, sans-serif' }}
                      >
                        {isTicketIdVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p
                      className="text-2xl font-bold tracking-widest text-center break-all"
                      style={{ fontFamily: 'AeonikBold, sans-serif' }}
                    >
                      {isTicketIdVisible ? selectedTicket.ticketID : '••••••••••••••••'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-purple-400" />
                      <span
                        style={{ fontFamily: 'AeonikLight, sans-serif' }}
                      >
                        {selectedEvent.date.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-purple-400" />
                      <span
                        style={{ fontFamily: 'AeonikLight, sans-serif' }}
                      >
                        Owner: You
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-purple-400" />
                      <span
                        style={{ fontFamily: 'AeonikLight, sans-serif' }}
                      >
                        Original Price: {selectedTicket.price} ICP
                      </span>
                    </div>
                    {'#Seated' in selectedTicket.kind && (
                      <div className="flex items-center gap-3">
                        <TicketIcon className="h-5 w-5 text-purple-400" />
                        <span
                          style={{ fontFamily: 'AeonikLight, sans-serif' }}
                        >
                          Seat: {selectedTicket.kind['#Seated'].seatInfo}
                        </span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-purple-400/20 space-y-2">
                      {selectedTicket.forSale ? (
                        <Button
                          className="w-full"
                          variant="destructive"
                          onClick={() => handleCancelListing(selectedTicket.id)}
                          style={{ fontFamily: 'AeonikBold, sans-serif' }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Cancel Marketplace Listing
                        </Button>
                      ) : (
                        selectedTicket.valid ? (
                          <Button
                            className="w-full"
                            onClick={() => navigate('/sell-ticket')}
                            style={{ fontFamily: 'AeonikBold, sans-serif' }}
                          >
                            <Store className="mr-2 h-4 w-4" /> Sell on Marketplace
                          </Button>
                        ) : (
                          <p
                            className="text-center text-red-400 font-semibold p-2 bg-red-900/20 rounded-md"
                            style={{ fontFamily: 'AeonikBold, sans-serif' }}
                          >
                            This ticket has been used.
                          </p>
                        )
                      )}
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled={!selectedTicket.valid}
                        style={{ fontFamily: 'AeonikBold, sans-serif' }}
                      >
                        Transfer Ownership
                      </Button>
                      <Link to={`/events/${selectedTicket.eventID}`}>
                        <Button
                          className="w-full"
                          variant="ghost"
                          style={{ fontFamily: 'AeonikBold, sans-serif' }}
                        >
                          View Event Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full bg-white/5 border-2 border-dashed border-purple-400/20 rounded-lg">
                <p
                  className="text-purple-300/70"
                  style={{ fontFamily: 'AeonikLight, sans-serif' }}
                >
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