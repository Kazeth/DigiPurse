import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthClient } from '@dfinity/auth-client';
import { Shield, Ticket, Wallet, Loader2 } from 'lucide-react';

export default function HomePage() {
    const [principalId, setPrincipalId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const navigate = useNavigate();

    // Fetch user identity on component mount
    useEffect(() => {
        AuthClient.create().then(async (client) => {
            const authenticated = await client.isAuthenticated();
            if (authenticated) {
                const identity = client.getIdentity();
                setPrincipalId(identity.getPrincipal().toText());
            }
            setIsLoading(false); // Set loading to false after checking
        });
    }, []);

    // Data for the main action cards
    const mainActions = [
        {
            title: 'My Documents',
            description: 'Access your verifiable credentials and digital IDs.',
            icon: Shield,
            path: '/digidocument',
            color: 'text-blue-400',
        },
        {
            title: 'My Tickets',
            description: 'View and manage your secure NFT event tickets.',
            icon: Ticket,
            path: '/digiticket',
            color: 'text-green-400',
        },
        {
            title: 'My Wallet',
            description: 'Send and receive payments on the blockchain.',
            icon: Wallet,
            path: '/digipayment',
            color: 'text-yellow-400',
        },
    ];

    // Show a loading spinner while fetching identity
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
                {/* Welcome Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Welcome Back</h1>
                        <p className="text-lg text-purple-300/80 mt-1">Here's your personal dashboard.</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <Link to="/postlogin">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?principal=${principalId}`} alt="User Avatar" />
                                <AvatarFallback className="text-xl bg-purple-800/50">
                                    {/* FIX: Only show fallback if principalId exists */}
                                    {principalId ? principalId.substring(0, 2).toUpperCase() : '??'}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className='hidden sm:block'>
                            <p className='text-white font-semibold'>User</p>
                            {/* FIX: Show placeholder if principalId is not yet available */}
                            <p className='text-sm text-purple-400 truncate w-32'>{principalId || 'Loading...'}</p>
                        </div>
                    </div>
                </div>

                {/* Main Action Grid */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Manage Your Assets</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mainActions.map((action) => (
                            <Card 
                                key={action.title} 
                                className="bg-white/5 border-purple-400/20 text-white backdrop-blur-lg hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
                                onClick={() => navigate(action.path)}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <action.icon className={`h-8 w-8 ${action.color}`} />
                                        <CardTitle className="text-xl text-white">{action.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-purple-300/80">{action.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Section (Placeholder) */}
                <div>
                    <h2 className="text-2xl font-semibold text-white mb-4">Recent Activity</h2>
                    <Card className="bg-white/5 border-purple-400/20 text-white backdrop-blur-lg">
                        <CardContent className="pt-6">
                            {/* Placeholder content */}
                            <div className="text-center text-purple-300/70">
                                <p>Your recent activity will appear here.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
