"use client";

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
import { createActor as createTicketActor, canisterId as ticketCanisterId } from '@/declarations/Ticket_backend';
import { createActor as createEventActor, canisterId as eventCanisterId } from '@/declarations/Event_backend';
import { motion } from 'framer-motion';

export default function SellTicketPage() {
    const navigate = useNavigate();
    const { authClient, isAuthenticated, principal } = useAuth();
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isListing, setIsListing] = useState(false);
    const [sellableTickets, setSellableTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [listingPrice, setListingPrice] = useState('');
    const [events, setEvents] = useState([]);

    // --- All backend logic remains unchanged ---
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
                    
                    const identity = authClient.getIdentity();
                    const ticketActor = createTicketActor(ticketCanisterId, { agentOptions: { identity } });
                    const eventActor = createEventActor(eventCanisterId, { agentOptions: { identity } });

                    const [userTicketsResult, allEventsResult] = await Promise.all([
                        ticketActor.getAllUserTicket(principal),
                        eventActor.getAllEvents()
                    ]);

                    const formattedEvents = allEventsResult.map(([id, event]) => ({
                        eventID: id,
                        eventName: event.name,
                    }));
                    setEvents(formattedEvents);

                    const formattedTickets = userTicketsResult.flatMap(([eventId, tickets]) =>
                        tickets.map(ticket => ({
                            ...ticket,
                            eventID: eventId,
                            price: Number(ticket.price),
                            owner: ticket.owner.toText(),
                        }))
                    ).filter(ticket => ticket.owner === principal.toText() && !ticket.isOnMarketplace);

                    setSellableTickets(formattedTickets);
                    if (formattedTickets.length > 0) {
                        setSelectedTicket(formattedTickets[0]);
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
    }, [isAuthenticated, principal, authClient]);

    const getEventForTicket = (ticket) => {
        return events.find(e => e.eventID === ticket.eventID);
    };

    const handleListTicket = async () => {
        if (!selectedTicket || !listingPrice || Number(listingPrice) <= 0) return;
        setIsListing(true);
        try {
            const ticketActor = createTicketActor(ticketCanisterId, { agentOptions: { identity: authClient.getIdentity() } });
            await ticketActor.sellTicket(selectedTicket.ticketID, BigInt(Number(listingPrice) * 1e8)); // Assuming price is in e8s
            // Ideally, show a success toast here
            navigate('/marketplace');
        } catch (error) {
            console.error("Failed to list ticket:", error);
            // Ideally, show an error toast here
        } finally {
            setIsListing(false);
        }
    };

    // --- Loading and Verification States ---
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
        );
    }

    if (!isVerified) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="bg-[#1e1033] p-8 rounded-2xl shadow-2xl shadow-purple-900/50 border border-purple-400/30 text-center max-w-md w-full">
                        <ShieldAlert className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'AeonikBold, sans-serif' }}>Verification Required</h2>
                        <p className="text-purple-200/80 mb-6" style={{ fontFamily: 'AeonikLight, sans-serif' }}>You must verify your identity before you can sell a ticket.</p>
                        <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-500" onClick={() => navigate('/digiidentity')} style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                            Go to Verification
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black text-white px-4 sm:px-6 lg:px-8 pt-28 pb-12
                        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                        from-purple-900/40 via-fuchsia-900/10 to-black">
            <div className="container mx-auto">
                <Link to="/digiticket" className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to My Tickets
                </Link>
                <motion.header 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                        Sell Your Ticket
                    </h1>
                    <p className="text-lg text-purple-300/80 mt-1" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                        Select a ticket you own and set a price to list it on the marketplace.
                    </p>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- MODIFIED: Ticket selection list with "glass" styling --- */}
                    <div className="lg:col-span-1 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                        <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                            1. Select a Ticket to Sell
                        </h2>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {sellableTickets.length > 0 ? (
                                sellableTickets.map(ticket => {
                                    const event = getEventForTicket(ticket);
                                    if (!event) return null;
                                    return (
                                        <Card
                                            key={ticket.ticketID}
                                            className={cn(
                                                "cursor-pointer bg-black/20 border border-white/10 hover:border-purple-400/50 transition-all",
                                                selectedTicket?.ticketID === ticket.ticketID && "border-purple-400/80 ring-2 ring-purple-400/50"
                                            )}
                                            onClick={() => { setSelectedTicket(ticket); setListingPrice(''); }}
                                        >
                                            <CardContent className="p-4">
                                                <p className="font-bold text-lg" style={{ fontFamily: 'AeonikBold, sans-serif' }}>{event.eventName}</p>
                                                <p className="text-sm text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                                    {'#Seated' in ticket.kind ? `Seat: ${ticket.kind['#Seated'].seatInfo}` : 'General Admission'}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            ) : (
                                <div className="flex items-center justify-center h-48 bg-black/20 border-2 border-dashed border-white/10 rounded-lg">
                                    <p className="text-purple-300/70 text-center" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                        You have no tickets available to sell.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- MODIFIED: Price setting card with "glass" styling --- */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                           2. Set Your Price
                        </h2>
                        {selectedTicket ? (
                            <Card className="bg-black/30 backdrop-blur-sm border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-2xl" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                        {getEventForTicket(selectedTicket)?.eventName}
                                    </CardTitle>
                                    <CardDescription className="text-purple-300/80 font-mono text-xs pt-1">
                                        ID: {selectedTicket.ticketID}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="price" className="text-lg" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                            Listing Price (in ICP)
                                        </Label>
                                        <div className="relative mt-2">
                                            <Input
                                                id="price"
                                                type="number"
                                                placeholder="e.g., 10.5"
                                                value={listingPrice}
                                                onChange={(e) => setListingPrice(e.target.value)}
                                                className="bg-black/20 border-purple-400/30 text-2xl font-bold pl-12 h-16"
                                                style={{ fontFamily: 'AeonikBold, sans-serif' }}
                                            />
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-purple-300/60" />
                                        </div>
                                    </div>
                                    <div className="!mt-6 p-4 bg-purple-900/20 border border-purple-400/20 rounded-lg flex items-start gap-3">
                                        <Info className="h-5 w-5 text-purple-300 flex-shrink-0 mt-1" />
                                        <p className="text-sm text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                            A small platform fee will be deducted upon successful sale. All listings are final until cancelled.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700 h-14 text-lg"
                                        size="lg"
                                        onClick={handleListTicket}
                                        disabled={!listingPrice || Number(listingPrice) <= 0 || isListing}
                                        style={{ fontFamily: 'AeonikBold, sans-serif' }}
                                    >
                                        {isListing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                                        {isListing ? 'Listing Ticket...' : 'List Ticket for Sale'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-black/30 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-2xl">
                                <p className="text-purple-300/70 text-lg" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                    Please select a ticket from the left to begin.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
