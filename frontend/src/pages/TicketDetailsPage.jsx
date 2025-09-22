"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar, Tag, User, Armchair, MapPin, ShieldAlert, Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Identity_backend } from 'declarations/Identity_backend';
import { createActor as createTicketActor, canisterId as ticketCanisterId } from '@/declarations/Ticket_backend';
import { createActor as createEventActor, canisterId as eventCanisterId } from '@/declarations/Event_backend';
import { motion } from 'framer-motion';

export default function TicketDetailsPage() {
    const { ticketID } = useParams();
    const navigate = useNavigate();
    const { authClient, isAuthenticated, principal } = useAuth();
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuying, setIsBuying] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);

    // --- All backend logic remains unchanged ---
    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated || !principal) {
                // Redirect will be handled by a protected route component,
                // but good to have a fallback.
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const identity = authClient.getIdentity();
                const identityOpt = await Identity_backend.getIdentity(principal);

                if (identityOpt.length > 0 && identityOpt[0].isVerified) {
                    setIsVerified(true);
                    
                    const ticketActor = createTicketActor(ticketCanisterId, { agentOptions: { identity } });
                    const eventActor = createEventActor(eventCanisterId, { agentOptions: { identity } });

                    // This logic is complex, assuming it correctly finds the single ticket by ID
                    const [allUserTickets, allOnSaleTickets] = await Promise.all([
                        ticketActor.getAllUserTicket(principal),
                        ticketActor.getAllOnSaleTicket()
                    ]);

                    let foundTicket = null;
                    const allTickets = [...allUserTickets, ...allOnSaleTickets];

                    for (const [eventId, tickets] of allTickets) {
                        const target = tickets.find(t => t.ticketID === ticketID);
                        if (target) {
                            foundTicket = { ...target, eventID: eventId };
                            break;
                        }
                    }

                    if (!foundTicket) throw new Error('Ticket not found or you do not have permission to view it.');
                    setTicket(foundTicket);
                    
                    const eventOpt = await eventActor.getEvent(foundTicket.eventID);
                    if (eventOpt.length === 0) throw new Error('Event for this ticket not found.');
                    
                    const rawEvent = eventOpt[0];
                    setEvent({
                        ...rawEvent,
                        name: rawEvent.name,
                        description: rawEvent.description,
                        date: new Date(Number(rawEvent.date / 1000000n)),
                        image: `https://placehold.co/1200x400/11071F/7C3AED/png?text=${encodeURIComponent(rawEvent.name)}`
                    });

                } else {
                    setIsVerified(false);
                }
            } catch (err) {
                console.error("Error loading details:", err)
                setError(err.message || 'Failed to load ticket details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [ticketID, isAuthenticated, principal, authClient]);

    const handleBuyTicket = async (ticket) => {
        if (!authClient) return;
        setIsBuying(true);
        try {
            const ticketActor = createTicketActor(ticketCanisterId, { agentOptions: { identity: authClient.getIdentity() } });
            // This is a placeholder for your actual transfer/purchase logic
            await ticketActor.transferTicket(ticket, principal);
            navigate("/digiticket", { 
                state: { 
                    newTicket: {
                        ...ticket,
                        eventDetail: event // Pass event details for immediate UI update
                    } 
                } 
            });
        } catch (error) {
            console.error("Failed to buy ticket:", error);
            setError("Purchase failed. The ticket may have already been sold.");
        } finally {
            setIsBuying(false);
        }
    };

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
                        <p className="text-purple-200/80 mb-6" style={{ fontFamily: 'AeonikLight, sans-serif' }}>You must verify your identity to view ticket details.</p>
                        <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-500" onClick={() => navigate('/digiidentity')} style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                            Go to Verification
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }
    
    if (error || !ticket || !event) {
        return (
            <div className="min-h-screen w-full bg-black text-white px-4 sm:px-6 lg:px-8 pt-28 pb-12 flex items-center justify-center
                        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                        from-purple-900/40 via-fuchsia-900/10 to-black">
                <div className="text-center">
                    <p className="text-2xl font-bold text-red-400" style={{ fontFamily: 'AeonikBold, sans-serif' }}>Error</p>
                    <p className="text-purple-300/80 mt-2" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                        {error || "Ticket or event data could not be loaded."}
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black text-white
                        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                        from-purple-900/40 via-fuchsia-900/10 to-black">
            {/* --- REDESIGNED: Event Hero Image --- */}
            <div className="h-64 md:h-80 bg-cover bg-center relative" style={{ backgroundImage: `url(${event.image})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end p-4 sm:p-6 lg:p-8">
                    <div className="container mx-auto">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="text-4xl md:text-6xl font-bold" style={{ fontFamily: 'AeonikBold, sans-serif' }}
                        >
                            {event.name}
                        </motion.h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Button variant="outline" className="mb-8" onClick={() => navigate(-1)} style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- REDESIGNED: Sticky Event Details Card --- */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
                        <Card className="bg-black/30 backdrop-blur-sm border border-white/10 sticky top-28">
                            <CardHeader>
                                <CardTitle className="text-2xl text-purple-300" style={{ fontFamily: 'AeonikBold, sans-serif' }}>Event Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-purple-300/80">
                                <p style={{ fontFamily: 'AeonikLight, sans-serif' }}>{event.description}</p>
                                <div className="border-t border-white/10 pt-4 space-y-3">
                                    <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-purple-400" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}>{event.date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></div>
                                    <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-purple-400" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}>{event.location || "Online Event"}</span></div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* --- REDESIGNED: Ticket Details & Purchase Card --- */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
                         <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'AeonikBold, sans-serif' }}>Marketplace Listing</h2>
                        <Card className="bg-black/30 backdrop-blur-sm border border-white/10">
                            <CardHeader>
                                <CardTitle className="text-2xl" style={{ fontFamily: 'AeonikBold, sans-serif' }}>{ticket.ticketDesc}</CardTitle>
                                <CardDescription className="text-purple-300/70 font-mono text-xs pt-1">ID: {ticket.ticketID}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg"><User className="h-5 w-5 text-purple-400" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}><strong>Seller:</strong> <span className="truncate">{ticket.owner.toText()}</span></span></div>
                                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg"><Tag className="h-5 w-5 text-purple-400" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}><strong>Price:</strong> {Number(ticket.price) / 1e8} ICP</span></div>
                                    {ticket.kind['#Seated'] && (<div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg"><Armchair className="h-5 w-5 text-purple-400" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}><strong>Seat:</strong> {ticket.kind['#Seated'].seatInfo}</span></div>)}
                                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg"><ShieldAlert className="h-5 w-5 text-purple-400" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}><strong>Status:</strong> <span className={ticket.valid ? "text-green-400" : "text-red-400"}>{ticket.valid ? 'Valid for Entry' : 'Used / Invalid'}</span></span></div>
                                </div>
                            </CardContent>
                             <CardFooter className="border-t border-white/10 pt-6">
                                <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700 h-14 text-lg" disabled={!ticket.valid || isBuying} onClick={() => handleBuyTicket(ticket)} style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                    {isBuying ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <ShoppingCart className="mr-2 h-5 w-5"/>}
                                    {isBuying ? "Processing Purchase..." : "Buy Ticket"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
