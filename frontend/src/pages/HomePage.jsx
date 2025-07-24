import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Ticket, Wallet, Loader2, FilePlus, ShoppingCart, Repeat, Fingerprint } from 'lucide-react';
import { useAuth } from '../AuthContext';

const mockUserProfile = {
    username: 'Mismoela',
    tickets: 2,
    documents: 5,
    balance: 12.5 
};

export default function HomePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const { isAuthenticated, principal } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(isAuthenticated) {
            setUserProfile(mockUserProfile);
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const mainActions = [
        {
            title: 'My Identity',
            description: 'Manage personal identity for event verification.',
            icon: Fingerprint,
            path: '/digiidentity',
            color: 'text-indigo-400',
        },
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

    const quickActions = [
        {
            title: 'Buy a Ticket',
            description: 'Browse the marketplace for new tickets.',
            icon: ShoppingCart,
            path: '/marketplace',
        },
        {
            title: 'Sell a Ticket',
            description: 'List one of your tickets for sale.',
            icon: Repeat,
            path: '/sell-ticket',
        },
        {
            title: 'Add a Document',
            description: 'Securely upload a new document or credential.',
            icon: FilePlus,
            path: '/digidocument', 
        },
    ]

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
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">
                            Welcome Back, {userProfile?.username}!
                        </h1>
                        <p className="text-lg text-purple-300/80 mt-1">Here's your personal dashboard.</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <Link to="/profile">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?principal=${principal}`} alt="User Avatar" />
                                <AvatarFallback className="text-xl bg-purple-800/50">
                                    {principal ? principal.toText().substring(0, 2).toUpperCase() : '??'}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className='hidden sm:block'>
                            <p className='text-white font-semibold'>{userProfile?.username}</p>
                            <p className='text-sm text-purple-400 truncate w-32'>{principal?.toText()}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Manage Your Assets</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mainActions.map((action) => (
                            <Card 
                                key={action.title} 
                                className="bg-white/5 border-purple-400/20 text-white backdrop-blur-lg hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
                                onClick={() => navigate(action.path)}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <action.icon className={`h-8 w-8 ${action.color}`} />
                                        <CardTitle className="text-xl text-white">{action.title}</CardTitle>
                                    </div>
                                    <p className="text-purple-300/80 pl-12"> 
                                        {action.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickActions.map((action) => (
                             <Card 
                                key={action.title} 
                                className="bg-white/5 border-purple-400/20 text-white backdrop-blur-lg hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
                                onClick={() => navigate(action.path)}
                            >
                                <CardContent className="pt-6 flex items-center gap-4">
                                    <action.icon className="h-8 w-8 text-purple-400" />
                                    <div>
                                        <p className="font-semibold text-lg">{action.title}</p>
                                        <p className="text-sm text-purple-300/80">{action.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
