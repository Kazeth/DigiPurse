import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Shield, Ticket, Wallet, Loader2, FilePlus, ShoppingCart, Repeat, 
    Fingerprint, History, TrendingUp, FileText
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
        { title: 'My Identity', description: 'Manage personal identity for event verification.', icon: Fingerprint, path: '/digiidentity', color: 'text-indigo-400' },
        { title: 'My Documents', description: 'Access your verifiable credentials and digital IDs.', icon: Shield, path: '/digidocument', color: 'text-blue-400' },
        { title: 'My Tickets', description: 'View and manage your secure NFT event tickets.', icon: Ticket, path: '/digiticket', color: 'text-green-400' },
        { title: 'My Wallet', description: 'Send and receive payments on the blockchain.', icon: Wallet, path: '/digipayment', color: 'text-yellow-400' },
        { title: 'My History', description: 'View your account activity and transaction logs.', icon: History, path: '/history', color: 'text-pink-400' },
    ];

    const quickActions = [
        { title: 'Buy a Ticket', icon: ShoppingCart, path: '/marketplace' },
        { title: 'Sell a Ticket', icon: Repeat, path: '/sell-ticket' },
        { title: 'Add a Document', icon: FilePlus, path: '/digidocument' },
    ];

    // Updated "At a Glance" data with icons and new text
    const overviewData = [
        { title: "Active Tickets", value: "4", change: "+1 this week", icon: Ticket },
        { title: "Stored Documents", value: "2", change: "All up to date", icon: FileText },
        { title: "Wallet Balance", value: "0.75 ICP", change: "+0.1 ICP", icon: Wallet },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-[#11071F]">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#11071F] to-[#1F112D] text-white p-4 sm:p-6 lg:p-8">
            <motion.div 
                className="container mx-auto"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Welcome Header */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
                    <div>
                        <h1
                            className="text-3xl sm:text-4xl font-bold"
                            style={{ fontFamily: 'AeonikBold, sans-serif' }}
                        >
                            Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{userProfile?.name || 'User'}!</span>
                        </h1>
                        <p
                            className="text-lg text-purple-300/80 mt-1"
                            style={{ fontFamily: 'AeonikLight, sans-serif' }}
                        >
                            Your secure digital dashboard awaits.
                        </p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-4 mt-4 sm:mt-0 bg-white/5 p-3 rounded-full border border-purple-400/20 hover:bg-white/10 transition-colors duration-300">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?principal=${principal}`} alt="User Avatar" />
                            <AvatarFallback className="text-lg bg-purple-800/50">
                                {userProfile ? userProfile.name.substring(0, 2).toUpperCase() : '??'}
                            </AvatarFallback>
                        </Avatar>
                        <div className='hidden sm:block'>
                            <p
                                className='font-semibold'
                                style={{ fontFamily: 'AeonikLight, sans-serif' }}
                            >
                                {userProfile?.name}
                            </p>
                            <p
                                className='text-xs text-purple-400 truncate w-32'
                                style={{ fontFamily: 'AeonikLight, sans-serif' }}
                            >
                                {principal?.toText()}
                            </p>
                        </div>
                    </Link>
                </motion.div>

                {/* At a Glance Section */}
                <motion.div variants={itemVariants} className="mb-12">
                    <h2
                        className="text-2xl font-semibold mb-4"
                        style={{ fontFamily: 'AeonikBold, sans-serif' }}
                    >
                        At a Glance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {overviewData.map(item => (
                            <Card key={item.title} className="bg-white/5 border-purple-400/20 backdrop-blur-lg">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle
                                        className="text-purple-300/90 font-medium text-base"
                                        style={{ fontFamily: 'AeonikBold, sans-serif' }}
                                    >
                                        {item.title}
                                    </CardTitle>
                                    <item.icon className="h-5 w-5 text-purple-400" />
                                </CardHeader>
                                <CardContent>
                                    <p
                                        className="text-3xl font-bold"
                                        style={{ fontFamily: 'AeonikBold, sans-serif' }}
                                    >
                                        {item.value}
                                    </p>
                                    <div className="flex items-center text-sm text-green-400 mt-1">
                                       <TrendingUp className="h-4 w-4 mr-1" /> 
                                       <span
                                           style={{ fontFamily: 'AeonikLight, sans-serif' }}
                                       >
                                           {item.change}
                                       </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Main Actions Section */}
                <motion.div variants={itemVariants} className="mb-12">
                    <h2
                        className="text-2xl font-semibold mb-4"
                        style={{ fontFamily: 'AeonikBold, sans-serif' }}
                    >
                        Manage Your Assets
                    </h2>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                    >
                        {mainActions.map((action) => (
                            <motion.div
                                key={action.title}
                                variants={itemVariants}
                                whileHover={{ y: -5, scale: 1.03 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="h-full"
                            >
                                <Card
                                    className="bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border-purple-400/20 text-white backdrop-blur-lg h-full cursor-pointer group hover:border-purple-400/50 transition-all duration-300"
                                    onClick={() => navigate(action.path)}
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white/10 rounded-lg">
                                                <action.icon className={`h-8 w-8 ${action.color}`} />
                                            </div>
                                            <div>
                                                <CardTitle
                                                    className="text-xl text-white mb-2"
                                                    style={{ fontFamily: 'AeonikBold, sans-serif' }}
                                                >
                                                    {action.title}
                                                </CardTitle>
                                                <p
                                                    className="text-purple-300/80"
                                                    style={{ fontFamily: 'AeonikLight, sans-serif' }}
                                                >
                                                    {action.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
                
                {/* Quick Actions Section */}
                <motion.div variants={itemVariants}>
                    <h2
                        className="text-2xl font-semibold mb-4"
                        style={{ fontFamily: 'AeonikBold, sans-serif' }}
                    >
                        Quick Actions
                    </h2>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        variants={containerVariants}
                    >
                        {quickActions.map((action) => (
                             <motion.div
                                key={action.title}
                                variants={itemVariants}
                                whileHover={{ y: -5, scale: 1.03 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <Card 
                                    className="bg-white/5 border-purple-400/20 text-white backdrop-blur-lg hover:border-purple-400/50 transition-all duration-300 cursor-pointer group"
                                    onClick={() => navigate(action.path)}
                                >
                                    <CardContent className="pt-6 flex items-center gap-4">
                                        <action.icon className="h-7 w-7 text-purple-400" />
                                        <p
                                            className="font-semibold text-lg"
                                            style={{ fontFamily: 'AeonikBold, sans-serif' }}
                                        >
                                            {action.title}
                                        </p>
                                    </CardContent>
                                </Card>
                             </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

            </motion.div>
        </div>
    );
}