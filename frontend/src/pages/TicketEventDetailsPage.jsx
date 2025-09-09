import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Tag, Users, User, ArrowLeft, Loader2 } from 'lucide-react';
import { createActor as createMasterTicketActor, canisterId as masterTicketCanisterId } from '@/declarations/MasterTicket_backend';
import { createActor as createTicketActor, canisterId as ticketCanisterId } from '@/declarations/Ticket_backend';
import { useAuth } from '@/lib/AuthContext';
import { Principal } from '@dfinity/principal';

export default function EventDetailPage() {
    const { eventID } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { authClient } = useAuth();

    const fromMarketplace = searchParams.get('from') === 'marketplace';
    const { event } = location.state || {};

    const [officialTicketTypes, setOfficialTicketTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMasterTickets = async () => {
            if (!eventID || !authClient) return;
            setIsLoading(true);
            try {
                const identity = authClient.getIdentity();
                const masterTicketActor = createMasterTicketActor(masterTicketCanisterId, {
                    agentOptions: { identity }
                });
                
                const relevantMasterTickets = await masterTicketActor.getMasterTicketByEventId(eventID);
                const relevantTickets = relevantMasterTickets[0].map((masterTicket) => ({
                    eventID: masterTicket.eventID,
                    desc: masterTicket.ticketDesc,
                    price: Number(masterTicket.price),
                    kind: masterTicket.kind,
                    valid: masterTicket.valid,
                    supply: masterTicket.ticketSupply
                }));
                
                console.log("Fetched master tickets:", relevantMasterTickets);
                console.log("Relevant tickets:", relevantTickets);

                setOfficialTicketTypes(relevantTickets);

            } catch (err) {
                console.error("Failed to fetch master tickets:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMasterTickets();
    }, [eventID, authClient]);

    if (!event) {
        return <div className="text-center p-12 text-white">Loading event data or event not found...</div>;
    }

    const handleBuy = async (ticketType) => {
        const ticketActor = createTicketActor(ticketCanisterId, {
            agentOptions: { identity: authClient.getIdentity() }
        });

        const newTicket = {
            id: `${ticketType.eventID}-${Date.now()}`,
            eventID: ticketType.eventID,
            price: ticketType.price,
            kind: ticketType.kind,
            owner: authClient.getIdentity().getPrincipal(), 
            valid: true,
            isOnMarketplace: false,
            eventDetail: {
                id: event.eventID,
                name: event.eventName,
                description: event.eventDesc,
                date: event.eventDate,
            }
        };

        await ticketActor.createTicket(
            ticketType.eventID,
            authClient.getIdentity().getPrincipal(),
            ticketType.desc,
            ticketType.price,
            ticketType.kind
        );
        navigate("/digiticket", { state: { newTicket: newTicket } });
    };

    return (
        <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] text-white">
            <div className="h-64 md:h-80 bg-cover bg-center relative" style={{ backgroundImage: `url(${event.image})` }}>
                <div className="absolute inset-0 bg-black/60 flex items-end p-8">
                    <div className="container mx-auto flex justify-between items-center">
                        <h1
                            className="text-4xl md:text-6xl font-bold"
                            style={{ fontFamily: 'AeonikBold, sans-serif' }}
                        >
                            {event.eventName}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Link
                    to="/events"
                    className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6"
                    style={{ fontFamily: 'AeonikLight, sans-serif' }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Events
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <Card className="bg-white/5 border-purple-400/20 sticky top-24">
                            <CardHeader>
                                <CardTitle
                                    className="text-2xl"
                                    style={{ fontFamily: 'AeonikBold, sans-serif' }}
                                >
                                    Event Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-purple-300/80">
                                <p
                                    style={{ fontFamily: 'AeonikLight, sans-serif' }}
                                >
                                    {event.eventDesc}
                                </p>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-purple-400" />
                                    <span
                                        style={{ fontFamily: 'AeonikLight, sans-serif' }}
                                    >
                                        {event.eventDate.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-purple-400" />
                                    <span
                                        style={{ fontFamily: 'AeonikLight, sans-serif' }}
                                    >
                                        Organizer: {Principal.from(event.organizer).toText()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-purple-400" />
                                    <span
                                        style={{ fontFamily: 'AeonikLight, sans-serif' }}
                                    >
                                        {Number(event.ticketCount)} Tickets Left
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div id="ticket-section" className="lg:col-span-2">
                        <h2
                            className="text-3xl font-bold mb-4 text-purple-300"
                            style={{ fontFamily: 'AeonikBold, sans-serif' }}
                        >
                            Official Tickets
                        </h2>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="h-12 w-12 text-white animate-spin" />
                            </div>
                        ) : officialTicketTypes.length > 0 ? (
                            <div className="space-y-4">
                                {officialTicketTypes.map((ticket, index) => (
                                    <Card key={index} className="bg-white/10 border-purple-400/30">
                                        <CardHeader>
                                            <CardTitle
                                                className="text-xl"
                                                style={{ fontFamily: 'AeonikBold, sans-serif' }}
                                            >
                                                {ticket.desc} ({Number(ticket.supply)} left)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                            <div className="text-2xl font-bold flex items-center gap-3 mb-4 sm:mb-0">
                                                <Tag className="h-6 w-6 text-purple-400" />
                                                <span
                                                    style={{ fontFamily: 'AeonikBold, sans-serif' }}
                                                >
                                                    {ticket.price} ICP
                                                </span>
                                            </div>
                                            <Button
                                                size="lg"
                                                onClick={() => handleBuy(ticket)}
                                                style={{ fontFamily: 'AeonikBold, sans-serif' }}
                                            >
                                                Buy Now
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-48 bg-white/5 rounded-lg">
                                <p
                                    className="text-lg text-purple-300/70"
                                    style={{ fontFamily: 'AeonikLight, sans-serif' }}
                                >
                                    Tickets are not available at the moment.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}