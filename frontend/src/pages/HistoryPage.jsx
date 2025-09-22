"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, UserPlus, Fingerprint, Ticket, Repeat, UploadCloud, Trash2, History as HistoryIcon } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { createActor, canisterId } from '@/declarations/Registry_backend';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

// --- MODIFIED: Language changed to English ---
const activityDetails = {
    'AccountCreated': {
        icon: UserPlus,
        title: "Account Created",
        color: "text-green-400",
        bgColor: "bg-green-500/10",
    },
    'IdentityVerified': {
        icon: Fingerprint,
        title: "Identity Verified",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
    },
    'TicketPurchased': {
        icon: Ticket,
        title: "Ticket Purchased",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
    },
    'TicketSold': {
        icon: Repeat,
        title: "Ticket Sold",
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
    },
    'DocumentUploaded': {
        icon: UploadCloud,
        title: "Document Uploaded",
        color: "text-indigo-400",
        bgColor: "bg-indigo-500/10",
    },
    'DocumentDeleted': {
        icon: Trash2,
        title: "Document Deleted",
        color: "text-red-400",
        bgColor: "bg-red-500/10",
    },
};

export default function HistoryPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [activityLogs, setActivityLogs] = useState([]);
    const { authClient, isLoggedIn } = useAuth();
    const identity = authClient ? authClient.getIdentity() : null;
    const principal = identity ? identity.getPrincipal() : null;

    useEffect(() => {
        async function fetchHistory() {
            if (!isLoggedIn || !identity || !principal) {
                setIsLoading(false);
                return;
            }
            const actor = createActor(canisterId, { agentOptions: { identity } });
            try {
                const logs = await actor.getUserActivity(principal);
                const sortedLogs = logs.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
                setActivityLogs(sortedLogs);
            } catch (err) {
                console.error("Failed to fetch activity history:", err);
                setActivityLogs([]);
            }
            setIsLoading(false);
        }
        fetchHistory();
    }, [isLoggedIn, authClient, identity, principal]);

    const formatTimestamp = (ns) => {
        const date = new Date(Number(ns) / 1000000);
        // --- MODIFIED: Language changed to English (US) ---
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
        );
    }

    return (
        // --- MODIFIED: Main page container with consistent styling and padding ---
        <div className="min-h-screen w-full bg-black text-white px-4 sm:px-6 lg:px-8 pt-28 pb-12
                        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                        from-purple-900/40 via-fuchsia-900/10 to-black">
            <div className="container mx-auto">
                <motion.div 
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* --- MODIFIED: Language changed to English --- */}
                    <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                        Your Activity History
                    </h1>
                    <p className="text-lg text-purple-300/80 mt-2" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                        A secure, immutable record of all your digital footprints.
                    </p>
                </motion.div>

                {activityLogs.length > 0 ? (
                    <div className="relative max-w-3xl mx-auto pl-8 border-l-2 border-white/10">
                        {activityLogs.map((log, index) => {
                            const type = Object.keys(log.activityType)[0];
                            const details = activityDetails[type] || {};
                            const IconComponent = details.icon || Ticket;

                            return (
                                <motion.div 
                                    key={index} 
                                    className="mb-10 relative"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    {/* --- MODIFIED: Timeline icon with correct ring color for the new background --- */}
                                    <div className={`absolute -left-[42px] top-1 w-8 h-8 rounded-full ${details.bgColor} flex items-center justify-center ring-4 ring-black`}>
                                        <IconComponent className={`h-5 w-5 ${details.color}`} />
                                    </div>
                                    {/* --- MODIFIED: Activity card with "glass" effect --- */}
                                    <Card className="bg-black/30 backdrop-blur-sm border border-white/10 text-white transition-all duration-300 hover:border-purple-400/50 hover:-translate-y-1">
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="font-bold text-lg text-white" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                                        {details.title}
                                                    </p>
                                                    <p className="text-purple-200/90 mt-1" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                                        {log.description}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-purple-300/70 whitespace-nowrap pl-4" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                                    {formatTimestamp(log.timestamp)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    // --- MODIFIED: Enhanced "Empty State" view ---
                    <div className="mt-16 text-center text-purple-300/70 flex flex-col items-center">
                        <div className="w-full max-w-lg bg-black/30 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-12">
                             <HistoryIcon className="h-16 w-16 mb-4 text-purple-400/50" />
                            <p className="text-xl font-medium text-white" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                No Activity Yet
                            </p>
                            <p className="mt-2" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                Start using the app to see your history recorded here.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}