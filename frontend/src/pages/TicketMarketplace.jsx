"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Event_backend } from 'declarations/Event_backend';
import { Ticket_backend, createActor, canisterId } from '@/declarations/Ticket_backend';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Slider from '@/components/ui/slider.jsx'; // Using the custom slider
import { Calendar, Tag, Search, FilterX, ArrowLeft, ArrowRight, Armchair, User, PlusCircle, Loader2, ShieldAlert, CheckCircle2, ShoppingCart } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Identity_backend } from 'declarations/Identity_backend';
import { motion } from 'framer-motion';

const TICKETS_PER_PAGE = 9;

export default function MarketplacePage() {
    const navigate = useNavigate();
    const { isAuthenticated, principal, authClient } = useAuth();
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [allMarketplaceTickets, setAllMarketplaceTickets] = useState([]);
    const [eventsMap, setEventsMap] = useState(new Map());
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState([0, 1000]); // MODIFIED: Use array for slider
    const [filterDate, setFilterDate] = useState('');
    const [seatType, setSeatType] = useState('all');
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [purchasedTicket, setPurchasedTicket] = useState(null);
    const [isBuying, setIsBuying] = useState(false);

    // --- All your existing backend logic remains unchanged ---
    useEffect(() => {
        const checkAndFetchData = async () => {
            if (!isAuthenticated || !principal) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const identityOpt = await Identity_backend.getIdentity(principal);
                const verified = identityOpt.length > 0 && identityOpt[0].isVerified;
                setIsVerified(verified);

                if (verified) {
                    const [eventResponse, ticketResponse] = await Promise.all([
                        Event_backend.getAllEvents(),
                        Ticket_backend.getAllOnSaleTicket()
                    ]);

                    const events = new Map(eventResponse.map(([id, event]) => [id, event]));
                    setEventsMap(events);

                    const parsedTickets = ticketResponse.flatMap(([eventId, tickets]) =>
                        tickets.map(ticket => ({
                            ticketID: ticket.ticketID,
                            eventID: eventId,
                            ticketDesc: ticket.ticketDesc,
                            price: Number(ticket.price),
                            kind: ticket.kind,
                            owner: ticket.owner,
                            valid: ticket.valid,
                            isOnMarketplace: ticket.isOnMarketplace,
                        }))
                    );
                    setAllMarketplaceTickets(parsedTickets);
                }
            } catch (error) {
                console.error("Failed to check identity or fetch data:", error);
                setIsVerified(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAndFetchData();
    }, [isAuthenticated, principal]);

    const filteredTickets = useMemo(() => {
        return allMarketplaceTickets
            .filter(ticket => {
                const event = eventsMap.get(ticket.eventID);
                return event ? event.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
            })
            .filter(ticket => ticket.price >= priceRange[0] && (priceRange[1] >= 1000 ? true : ticket.price <= priceRange[1]))
            .filter(ticket => {
                if (!filterDate) return true;
                const event = eventsMap.get(ticket.eventID);
                const eventDate = event ? new Date(Number(event.date) / 1000000).toISOString().split('T')[0] : '';
                return eventDate === filterDate;
            })
            .filter(ticket => {
                if (seatType === 'seated') return ticket.kind.hasOwnProperty('#Seated');
                if (seatType === 'seatless') return ticket.kind.hasOwnProperty('#Seatless');
                return true;
            });
    }, [searchTerm, priceRange, filterDate, seatType, allMarketplaceTickets, eventsMap]);

     useEffect(() => {
        setCurrentPage(1);
    }, [filteredTickets]);


    const totalPages = Math.ceil(filteredTickets.length / TICKETS_PER_PAGE);
    const currentTickets = filteredTickets.slice((currentPage - 1) * TICKETS_PER_PAGE, currentPage * TICKETS_PER_PAGE);

    const handleResetFilters = () => {
        setSearchTerm('');
        setPriceRange([0, 1000]);
        setFilterDate('');
        setSeatType('all');
    };

    const handleBuyTicket = async (ticket) => {
        if (!authClient) return;
        setIsBuying(true);
        try {
            const ticketActor = createActor(canisterId, { agentOptions: { identity: authClient.getIdentity() } });
            // This is a placeholder for your actual transfer logic which may involve payment
            await ticketActor.transferTicket(ticket, authClient.getIdentity().getPrincipal());
            setPurchasedTicket(ticket);
            setBuyModalOpen(true);
            // Refresh tickets after purchase
            setAllMarketplaceTickets(prev => prev.filter(t => t.ticketID !== ticket.ticketID));
        } catch (error) {
            console.error("Failed to transfer ticket:", error);
        } finally {
            setIsBuying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
                <p className="mt-4 text-white text-lg" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                    Loading Marketplace...
                </p>
            </div>
        );
    }

    if (!isVerified) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="bg-[#1e1033] p-8 rounded-2xl shadow-2xl shadow-purple-900/50 border border-purple-400/30 text-center max-w-md w-full">
                        <ShieldAlert className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                            Verification Required
                        </h2>
                        <p className="text-purple-200/80 mb-6" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                            For your security, you must verify your identity before accessing the ticket marketplace.
                        </p>
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
                <motion.header 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 pb-8 border-b border-white/10">
                    <div className="text-center sm:text-left">
                        <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                            Ticket Marketplace
                        </h1>
                        <p className="text-lg text-purple-300/80 mt-2" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                            Discover and purchase verifiable, on-chain tickets from other users.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Button onClick={() => navigate('/sell-ticket')} className="bg-purple-600 hover:bg-purple-700 text-base px-6 py-5" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                            <PlusCircle className="mr-2 h-5 w-5" /> Sell a Ticket
                        </Button>
                    </div>
                </motion.header>

                <Card className="bg-black/30 backdrop-blur-sm border border-white/10 p-6 mb-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                        <div className="lg:col-span-2 space-y-2">
                            <Label htmlFor="search" className="text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Search Event</Label>
                            <Input id="search" placeholder="e.g., Web3 Summit" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/20 border-purple-400/30 h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Max Price (ICP)</Label>
                            <div className="flex justify-between text-sm text-purple-300">
                                <span>{priceRange[0]}</span>
                                <span>{priceRange[1] >= 1000 ? `${priceRange[1]}+` : priceRange[1]}</span>
                            </div>
                             <Slider defaultValue={[0, 1000]} max={1000} step={10} value={priceRange} onValueChange={setPriceRange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="date" className="text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Event Date</Label>
                            <Input id="date" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-black/20 border-purple-400/30 h-12" />
                        </div>
                        <div className="space-y-2">
                             <Label className="text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Ticket Type</Label>
                             <Tabs value={seatType} onValueChange={setSeatType} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-black/20 h-12">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="seated">Seated</TabsTrigger>
                                    <TabsTrigger value="seatless">Seatless</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                    <div className="text-center mt-6">
                         <Button variant="ghost" onClick={handleResetFilters} className="text-purple-300/70 hover:text-white"><FilterX className="mr-2 h-4 w-4" /> Reset Filters</Button>
                    </div>
                </Card>

                <main>
                    {currentTickets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {currentTickets.map(ticket => {
                                const event = eventsMap.get(ticket.eventID);
                                if (!event) return null;
                                return (
                                    <motion.div key={ticket.ticketID} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                    <Card className="bg-black/30 backdrop-blur-sm border border-white/10 flex flex-col group h-full hover:border-purple-400/50 transition-colors duration-300">
                                        <CardHeader>
                                            <CardTitle className="group-hover:text-purple-300 transition-colors" style={{ fontFamily: 'AeonikBold, sans-serif' }}>{event.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 pt-1 text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                                <Calendar className="h-4 w-4" />
                                                {new Date(Number(event.date) / 1000000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow space-y-3">
                                            <div className="flex items-center gap-2 text-2xl font-bold"><Tag className="h-6 w-6 text-purple-300" /><span style={{ fontFamily: 'AeonikBold, sans-serif' }}>{ticket.price} ICP</span></div>
                                            <div className="flex items-center gap-2 text-xs truncate text-purple-300/80"><User className="h-4 w-4" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}>Owner: {ticket.owner.toText() || 'N/A'}</span></div>
                                            {ticket.kind['#Seated'] && (
                                                <div className="flex items-center gap-2 text-sm text-purple-300"><Armchair className="h-4 w-4" /><span style={{ fontFamily: 'AeonikLight, sans-serif' }}>{ticket.kind['#Seated'].seatInfo || 'Seated'}</span></div>
                                            )}
                                        </CardContent>
                                        <CardFooter className="flex flex-col sm:flex-row gap-2">
                                            <Button className="w-full sm:flex-1" variant="outline" asChild><Link to={`/events/${ticket.eventID}`}>View Event</Link></Button>
                                            <Button className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => handleBuyTicket(ticket)} disabled={isBuying}><ShoppingCart className="mr-2 h-4 w-4" />{isBuying ? "Processing..." : "Buy Now"}</Button>
                                        </CardFooter>
                                    </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                         <div className="mt-16 text-center text-purple-300/70 flex flex-col items-center">
                            <div className="w-full max-w-lg bg-black/30 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-12">
                                <FilterX className="h-16 w-16 mb-4 text-purple-400/50" />
                                <p className="text-xl font-medium text-white" style={{ fontFamily: 'AeonikBold, sans-serif' }}>No Tickets Found</p>
                                <p className="mt-2" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Try adjusting your filters or check back later.</p>
                            </div>
                        </div>
                    )}
                </main>

                {totalPages > 1 && (
                     <div className="flex items-center justify-center mt-12 space-x-4">
                        <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
                        <span className="font-semibold text-purple-200" style={{ fontFamily: 'AeonikBold, sans-serif' }}>Page {currentPage} of {totalPages}</span>
                        <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                )}
            </div>

            <Dialog open={buyModalOpen} onOpenChange={setBuyModalOpen}>
                <DialogContent className="bg-[#1e1033] text-white border-purple-400/30">
                    <DialogHeader>
                        <DialogTitle className="text-purple-300 text-2xl" style={{ fontFamily: 'AeonikBold, sans-serif' }}>Purchase Successful!</DialogTitle>
                        <DialogDescription className="text-purple-300/70" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                            You've successfully acquired the ticket for "{eventsMap.get(purchasedTicket?.eventID)?.name}". It's now available in your "My Tickets" section.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => navigate('/digiticket')} className="w-full bg-purple-600 hover:bg-purple-700"><CheckCircle2 className="mr-2 h-5 w-5" /> Go to My Tickets</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
