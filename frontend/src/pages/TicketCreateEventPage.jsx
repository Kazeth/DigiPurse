"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PlusCircle, Ticket, Armchair, Users, Loader2, Trash2, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { createActor as createEventActor, canisterId as eventCanisterId } from '@/declarations/Event_backend';
import { createActor as createMasterTicketActor, canisterId as masterTicketCanisterId } from '@/declarations/MasterTicket_backend';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';

export default function CreateEventPage() {
    const navigate = useNavigate();
    const { authClient, isLoggedIn, principal } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [createdEventId, setCreatedEventId] = useState('');

    // Event Details State
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');

    // Ticket Tiers State
    const [ticketTiers, setTicketTiers] = useState([
        { desc: 'General Admission', price: '', supply: '', kind: { '#Seatless': null } },
    ]);

    useEffect(() => {
        if (!isLoggedIn || !principal) {
            setError('You must be logged in to create an event.');
        }
        setIsLoading(false);
    }, [isLoggedIn, principal]);

    const handleTierChange = (index, field, value) => {
        const newTiers = [...ticketTiers];
        if (field === 'kind') {
            newTiers[index][field] = value === 'seated' ? { '#Seated': 'General Seating' } : { '#Seatless': null };
        } else {
            newTiers[index][field] = value;
        }
        setTicketTiers(newTiers);
    };

    const addTier = () => {
        setTicketTiers([...ticketTiers, { desc: '', price: '', supply: '', kind: { '#Seatless': null } }]);
    };

    const removeTier = (index) => {
        setTicketTiers(ticketTiers.filter((_, i) => i !== index));
    };

    const totalTicketSupply = ticketTiers.reduce((sum, tier) => sum + (Number(tier.supply) || 0), 0);
    
    const validateInputs = () => {
        if (!isLoggedIn || !principal) return 'You must be logged in to create an event.';
        if (!eventName.trim()) return 'Event name is required.';
        if (!eventDescription.trim()) return 'Event description is required.';
        if (!eventDate || !eventTime) return 'Event date and time are required.';
        if (!durationMinutes || Number(durationMinutes) <= 0) return 'Duration must be a positive number.';
        if (ticketTiers.length === 0) return 'At least one ticket tier is required.';
        for (const tier of ticketTiers) {
            if (!tier.desc.trim()) return 'Each ticket tier must have a description.';
            if (tier.price === '' || Number(tier.price) < 0) return 'Each ticket tier must have a non-negative price.';
            if (!tier.supply || Number(tier.supply) <= 0) return 'Each ticket tier must have a positive quantity.';
        }
        return null;
    };

    const convertTicketKind = (kind) => {
        if ('#Seatless' in kind) return { Seatless: null };
        if ('#Seated' in kind) return { Seated: { seatInfo: kind['#Seated'] || 'General Seating' } };
        throw new Error('Invalid ticket kind');
    };
    
    // --- NEW: Added the missing resetForm function ---
    const resetForm = () => {
        setEventName('');
        setEventDescription('');
        setEventDate('');
        setEventTime('');
        setDurationMinutes('');
        setTicketTiers([{ desc: 'General Admission', price: '', supply: '', kind: { '#Seatless': null } }]);
        setSuccessModalOpen(false);
        setError('');
    };

    const handleCreateEvent = async () => {
        const validationError = validateInputs();
        if (validationError) {
            setError(validationError);
            return;
        }
        setIsCreating(true);
        setError('');
        try {
            const identity = authClient.getIdentity();
            const eventActor = createEventActor(eventCanisterId, { agentOptions: { identity } });
            const date = new Date(`${eventDate}T${eventTime}`);
            const dateInNanoseconds = BigInt(date.getTime()) * 1_000_000n;
            
            const createdEvent = await eventActor.createEvent(
                eventName,
                principal,
                eventDescription,
                dateInNanoseconds,
                BigInt(durationMinutes),
                BigInt(totalTicketSupply),
                ticketTiers.map(tier => BigInt(Number(tier.price) * 1e8)), // Assuming price in e8s
                convertTicketKind(ticketTiers[0].kind), // Use first tier's kind as the event's primary kind
                true
            );

            const masterTicketActor = createMasterTicketActor(masterTicketCanisterId, { agentOptions: { identity } });
            for (const tier of ticketTiers) {
                await masterTicketActor.createMasterTicket(
                    createdEvent.id,
                    tier.desc,
                    BigInt(Number(tier.price) * 1e8),
                    convertTicketKind(tier.kind),
                    BigInt(tier.supply)
                );
            }

            setCreatedEventId(createdEvent.id);
            setSuccessModalOpen(true);
        } catch (err) {
            console.error('Failed to create event:', err);
            setError(`Failed to create event: ${err.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen w-full bg-black text-white px-4 sm:px-6 lg:px-8 pt-28 pb-12
                        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                        from-purple-900/40 via-fuchsia-900/10 to-black">
            <div className="container mx-auto max-w-4xl">
                <Link to="/events" className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Events
                </Link>
                <motion.header 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                        Create a New Event
                    </h1>
                    <p className="text-lg text-purple-300/80 mt-1" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                        Fill out the details below to list your event on DigiPurse.
                    </p>
                </motion.header>

                <div className="space-y-8">
                    {/* Step 1 Card */}
                    <Card className="bg-black/30 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-2xl text-purple-300" style={{ fontFamily: 'AeonikBold, sans-serif' }}>1. Event Details</CardTitle>
                            <CardDescription className="text-purple-300/70" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                Provide the core information about your event.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="eventName" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Event Name</Label>
                                <Input id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g., ICP Innovate Summit" className="bg-black/20 border-purple-400/30 h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eventDescription" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Event Description</Label>
                                <textarea id="eventDescription" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Tell us more about your event..." className="w-full min-h-[120px] bg-black/20 border-purple-400/30 rounded-md p-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2"><Label htmlFor="eventDate" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Date</Label><Input id="eventDate" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="bg-black/20 border-purple-400/30 h-12" /></div>
                                <div className="space-y-2"><Label htmlFor="eventTime" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Start Time</Label><Input id="eventTime" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="bg-black/20 border-purple-400/30 h-12" /></div>
                                <div className="space-y-2"><Label htmlFor="durationMinutes" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Duration (Minutes)</Label><Input id="durationMinutes" type="number" min="1" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="e.g., 180" className="bg-black/20 border-purple-400/30 h-12" /></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step 2 Card */}
                    <Card className="bg-black/30 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-2xl text-purple-300" style={{ fontFamily: 'AeonikBold, sans-serif' }}>2. Ticket Tiers</CardTitle>
                            <CardDescription className="text-purple-300/70" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Define the different types of tickets for your event.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ticketTiers.map((tier, index) => (
                                <div key={index} className="p-4 bg-black/20 rounded-lg border border-white/10">
                                    <div className="flex justify-between items-center mb-4"><h4 className="font-semibold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>Ticket Tier #{index + 1}</h4>{ticketTiers.length > 1 && (<Button variant="destructive" size="icon" onClick={() => removeTier(index)}><Trash2 className="h-4 w-4" /></Button>)}</div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2"><Label htmlFor={`tier-desc-${index}`} style={{ fontFamily: 'AeonikLight, sans-serif' }}>Tier Name</Label><Input id={`tier-desc-${index}`} value={tier.desc} onChange={(e) => handleTierChange(index, 'desc', e.target.value)} placeholder="e.g., VIP Access" className="bg-black/30" /></div>
                                        <div className="space-y-2"><Label htmlFor={`tier-price-${index}`} style={{ fontFamily: 'AeonikLight, sans-serif' }}>Price (ICP)</Label><Input id={`tier-price-${index}`} type="number" min="0" value={tier.price} onChange={(e) => handleTierChange(index, 'price', e.target.value)} placeholder="e.g., 1.5" className="bg-black/30" /></div>
                                        <div className="space-y-2"><Label htmlFor={`tier-supply-${index}`} style={{ fontFamily: 'AeonikLight, sans-serif' }}>Quantity</Label><Input id={`tier-supply-${index}`} type="number" min="1" value={tier.supply} onChange={(e) => handleTierChange(index, 'supply', e.target.value)} placeholder="e.g., 100" className="bg-black/30" /></div>
                                    </div>
                                    <div className="mt-4 space-y-2"><Label style={{ fontFamily: 'AeonikLight, sans-serif' }}>Ticket Kind</Label><div className="flex gap-2"><Button variant={'#Seatless' in tier.kind ? 'secondary' : 'outline'} onClick={() => handleTierChange(index, 'kind', 'seatless')} className="flex-1 text-sm"><Users className="mr-2 h-4 w-4" /> Seatless</Button><Button variant={'#Seated' in tier.kind ? 'secondary' : 'outline'} onClick={() => handleTierChange(index, 'kind', 'seated')} className="flex-1 text-sm"><Armchair className="mr-2 h-4 w-4" /> Seated</Button></div></div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={addTier} className="w-full mt-4 h-12 border-purple-400/50 text-purple-300 hover:bg-purple-500/10 hover:text-white" style={{ fontFamily: 'AeonikBold, sans-serif' }}><PlusCircle className="mr-2 h-4 w-4" /> Add Another Tier</Button>
                        </CardContent>
                    </Card>

                    {/* Step 3 Review Card */}
                    <Card className="bg-black/30 backdrop-blur-sm border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-2xl text-purple-300" style={{ fontFamily: 'AeonikBold, sans-serif' }}>3. Review & Create</CardTitle>
                            <CardDescription className="text-purple-300/70" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Confirm your details before creating the event on-chain.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="p-4 bg-purple-900/20 border border-purple-400/20 rounded-lg flex items-start gap-3">
                                <Info className="h-5 w-5 text-purple-300 flex-shrink-0 mt-1" />
                                <p className="text-sm text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                    Creating an event is a blockchain transaction. Please ensure all details are correct as some may not be editable later.
                                </p>
                            </div>
                             {error && (<p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-md">{error}</p>)}
                        </CardContent>
                        <CardFooter>
                            <Button size="lg" onClick={handleCreateEvent} disabled={isCreating} className="w-full bg-purple-600 hover:bg-purple-700 h-14 text-lg" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Ticket className="mr-2 h-5 w-5" />}
                                {isCreating ? 'Creating Event...' : `Create Event & ${totalTicketSupply} Tickets`}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Success Modal */}
                <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
                    <DialogContent className="bg-[#1e1033] text-white border-purple-400/30">
                        <DialogHeader>
                            <div className="text-center">
                                <CheckCircle2 className="mx-auto h-16 w-16 text-green-400 mb-4" />
                                <DialogTitle className="text-white text-2xl" style={{ fontFamily: 'AeonikBold, sans-serif' }}>Event Created Successfully!</DialogTitle>
                                <DialogDescription className="text-purple-300/70 pt-2" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                    Your event "{eventName}" has been created on the blockchain.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                            <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">Create Another Event</Button>
                            <Button onClick={() => navigate(`/events/${createdEventId}`)} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">View Event Page</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

