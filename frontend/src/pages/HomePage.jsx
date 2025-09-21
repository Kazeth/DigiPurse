"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Ticket, FilePlus, ShoppingCart, Repeat, Fingerprint, History, 
    TrendingUp, FileText, Wallet, Loader2, ArrowUpRight, UploadCloud, ArrowLeftRight
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { createActor, canisterId } from '@/declarations/Registry_backend';

export default function HomePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const { authClient, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const identity = authClient ? authClient.getIdentity() : null;
    const principal = identity ? identity.getPrincipal() : null;

    useEffect(() => {
        async function fetchProfile() {
            if (!authClient || !identity || !principal || !isLoggedIn) {
                setIsLoading(false);
                return;
            };
            setIsLoading(true);
            const actor = createActor(canisterId, { agentOptions: { identity } });
            try {
                const profArr = await actor.getCustomerProfile(principal);
                setUserProfile(profArr ? profArr[0] : null);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setUserProfile(null);
            }
            setIsLoading(false);
        }
        fetchProfile();
    }, [isLoggedIn, authClient, identity, principal]);

    const mainActions = [
        { title: 'My Identity', description: 'View and manage your verifiable credentials.', icon: Fingerprint, path: '/digiidentity', color: 'text-indigo-400' },
        { title: 'My Documents', description: 'Access your secure, decentralized documents.', icon: FileText, path: '/digidocument', color: 'text-blue-400' },
        { title: 'My Tickets', description: 'Manage your unique NFT event tickets.', icon: Ticket, path: '/digiticket', color: 'text-green-400' },
        { title: 'My Wallet', description: 'View balance and transaction history.', icon: Wallet, path: '/digipayment', color: 'text-yellow-400' },
        // --- CORRECTED: "My History" card is restored here ---
        { title: 'My History', description: 'Review all your account activity logs.', icon: History, path: '/history', color: 'text-pink-400' },
    ];

    const quickActions = [
        { title: 'Buy a Ticket', icon: ShoppingCart, path: '/marketplace' },
        { title: 'Sell a Ticket', icon: Repeat, path: '/sell-ticket' },
        { title: 'Add a Document', icon: FilePlus, path: '/digidocument' },
    ];

    const overviewData = [
        { title: "Active Tickets", value: "4", change: "+1 this week", icon: Ticket },
        { title: "Stored Documents", value: "2", change: "All up to date", icon: FileText },
        { title: "Wallet Balance", value: "0.75 ICP", change: "+0.1 ICP", icon: Wallet },
    ];
    
    const recentHistoryData = [
        { id: 1, type: 'Ticket Purchase', description: 'Event: Interstellar Live', date: 'Sep 19, 2025', icon: ArrowUpRight, color: 'text-green-400' },
        { id: 2, type: 'Document Upload', description: 'Uploaded: ID_Card.pdf', date: 'Sep 18, 2025', icon: UploadCloud, color: 'text-blue-400' },
        { id: 3, type: 'ICP Transfer', description: 'Sent 0.25 ICP to ...', date: 'Sep 16, 2025', icon: ArrowLeftRight, color: 'text-yellow-400' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.07, delayChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };
    
    const cardBaseClasses = "bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl transition-all duration-300";
    const cardHoverClasses = "hover:border-purple-400/50 hover:-translate-y-1";

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
            
            <motion.div 
                className="container mx-auto"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                            Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{userProfile?.name || 'User'}!</span>
                        </h1>
                        <p className="text-lg text-purple-300/80 mt-1" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                            Your secure digital dashboard.
                        </p>
                    </div>
                    <Link to="/profile" className={`flex items-center gap-4 mt-4 sm:mt-0 p-2 rounded-full ${cardBaseClasses} ${cardHoverClasses}`}>
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?principal=${principal}`} alt="User Avatar" />
                            <AvatarFallback className="text-lg bg-purple-800/50">
                                {userProfile ? userProfile.name.substring(0, 2).toUpperCase() : '??'}
                            </AvatarFallback>
                        </Avatar>
                        <div className='hidden sm:block mr-4'>
                            <p className='font-semibold' style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                {userProfile?.name}
                            </p>
                            <p className='text-xs text-purple-400/80 truncate w-32' style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                {principal?.toText()}
                            </p>
                        </div>
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
                    
                    <motion.div variants={itemVariants} className="flex flex-col gap-8">
                        <div>
                           <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                Manage Your Assets
                            </h2>
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                variants={containerVariants}
                            >
                                {mainActions.map((action) => (
                                    <motion.div
                                        key={action.title}
                                        variants={itemVariants}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                        className="h-full"
                                    >
                                        <Card
                                            className={`${cardBaseClasses} h-full cursor-pointer group hover:border-purple-400/50`}
                                            onClick={() => navigate(action.path)}
                                        >
                                            <CardContent className="pt-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                                        <action.icon className={`h-8 w-8 ${action.color}`} />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-xl text-white mb-2" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                                            {action.title}
                                                        </CardTitle>
                                                        <p className="text-purple-300/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                                            {action.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                    Recent History
                                </h2>
                                <Link to="/history" className="text-sm text-purple-400 hover:text-purple-300 transition-colors" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                    View All
                                </Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                {recentHistoryData.map(item => (
                                     <motion.div
                                        key={item.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -2, scale: 1.01 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Card className={`${cardBaseClasses} cursor-pointer group hover:border-purple-400/40`}>
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                                        <item.icon className={`h-6 w-6 ${item.color}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{item.type}</p>
                                                        <p className="text-sm text-purple-300/70">{item.description}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-purple-300/70 hidden sm:block">{item.date}</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col gap-8">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                At a Glance
                            </h2>
                            <div className="flex flex-col gap-4">
                                {overviewData.map(item => (
                                    <Card key={item.title} className={cardBaseClasses}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-purple-300/90 font-medium text-base" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                                {item.title}
                                            </CardTitle>
                                            <item.icon className="h-5 w-5 text-purple-400" />
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-3xl font-bold" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                                {item.value}
                                            </p>
                                            <div className="flex items-center text-sm text-green-400/80 mt-1">
                                               {item.change.startsWith('+') && <TrendingUp className="h-4 w-4 mr-1" />}
                                                <span style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                                                    {item.change}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                Quick Actions
                            </h2>
                            <div className="flex flex-col gap-4">
                                {quickActions.map((action) => (
                                     <motion.div
                                        key={action.title}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Card 
                                            className={`${cardBaseClasses} cursor-pointer group hover:border-purple-400/50`}
                                            onClick={() => navigate(action.path)}
                                        >
                                            <CardContent className="pt-6 flex items-center gap-4">
                                                <action.icon className="h-7 w-7 text-purple-400" />
                                                <p className="font-semibold text-lg" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                                                    {action.title}
                                                </p>
                                            </CardContent>
                                        </Card>
                                     </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
}