import React, { useState, useEffect } from 'react';
import { Loader2, UserPlus, Fingerprint, Ticket, Repeat } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { createActor, canisterId } from '@/declarations/Registry_backend';
import { Card, CardContent } from '@/components/ui/card';

// Objek untuk memetakan tipe aktivitas ke ikon dan judul
const activityDetails = {
    'AccountCreated': {
        icon: UserPlus,
        title: "Akun Dibuat",
        color: "text-green-400",
        bgColor: "bg-green-500/10",
    },
    'IdentityVerified': {
        icon: Fingerprint,
        title: "Identitas Diverifikasi",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
    },
    'TicketPurchased': {
        icon: Ticket,
        title: "Tiket Dibeli",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
    },
    'TicketSold': {
        icon: Repeat,
        title: "Tiket Terjual",
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
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
                // Waktu dari Motoko dalam nanosekon, konversi ke milisekon untuk JS
                const sortedLogs = logs.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
                setActivityLogs(sortedLogs);
            } catch (err) {
                console.error("Gagal mengambil riwayat aktivitas:", err);
                setActivityLogs([]);
            }
            setIsLoading(false);
        }
        fetchHistory();
    }, [isLoggedIn, authClient]);

    const formatTimestamp = (ns) => {
        // Konversi nanosekon ke milisekon
        const date = new Date(Number(ns) / 1000000);
        return date.toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-[#11071F]">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-10rem)] bg-[#11071F] p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto">
                <div className="mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
                        Riwayat Aktivitas Anda
                    </h1>
                    <p className="text-lg text-purple-300/80 mt-2 text-center">
                        Semua jejak digital Anda tercatat aman di sini.
                    </p>
                </div>

                {activityLogs.length > 0 ? (
                    <div className="relative max-w-2xl mx-auto pl-8 border-l-2 border-purple-400/30">
                        {activityLogs.map((log, index) => {
                            const type = Object.keys(log.activityType)[0];
                            const details = activityDetails[type] || {};
                            const IconComponent = details.icon || Ticket;

                            return (
                                <div key={index} className="mb-10 relative">
                                    <div className={`absolute -left-[42px] top-1 w-8 h-8 rounded-full ${details.bgColor} flex items-center justify-center ring-4 ring-[#11071F]`}>
                                        <IconComponent className={`h-5 w-5 ${details.color}`} />
                                    </div>
                                    <Card className="bg-white/5 border-purple-400/20 text-white backdrop-blur-lg">
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-lg text-white">{details.title}</p>
                                                    <p className="text-purple-200/90 mt-1">{log.description}</p>
                                                </div>
                                                <p className="text-xs text-purple-300/70 whitespace-nowrap pl-4">
                                                    {formatTimestamp(log.timestamp)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-xl text-purple-300/80">Belum ada aktivitas yang tercatat.</p>
                        <p className="mt-2 text-gray-400">Mulai gunakan aplikasi untuk melihat riwayat Anda di sini.</p>
                    </div>
                )}
            </div>
        </div>
    );
}