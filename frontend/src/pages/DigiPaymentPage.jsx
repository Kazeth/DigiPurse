import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label'; // FIX: Added missing import for Label
import { ArrowUpRight, ArrowDownLeft, Send, QrCode, Plus, Repeat, ExternalLink, Wallet, Copy, Check, Info, FileText, Ticket, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
const connectedWallet = {
    principalId: 'b77a5-d2g6j-l4g7b-a5b7g-6g6a5-d2g6j-l4g7b-a5b7g-cai',
    identityName: 'roony.icp',
    portfolioValueUSD: 8540.50,
    assets: [
        { symbol: 'ICP', name: 'Internet Computer', balance: 500.25, usdValue: 8004.00, logo: 'https://cryptologos.cc/logos/internet-computer-icp-logo.png' },
        { symbol: 'GHOST', name: 'Ghost Token', balance: 10000, usdValue: 536.50, logo: 'https://assets.coingecko.com/coins/images/18523/standard/ghost.png' },
    ],
};

const recentTransactions = [
    { type: 'Ticket Purchase', details: 'Bought ticket for Web3 Summit', amount: '-120.0 GHOST', time: '1:15 PM', icon: Ticket },
    { type: 'Receive', details: 'From Principal ...l4g7b', amount: '+25.0 ICP', time: '10:30 AM', icon: ArrowDownLeft },
    { type: 'Document Storage', details: 'Fee for storing passport.jpg', amount: '-0.05 ICP', time: 'Yesterday', icon: FileText },
    { type: 'Send', details: 'To Principal ...a5b7g', amount: '-5.0 ICP', time: '2 days ago', icon: ArrowUpRight },
];

// --- Helper component for copy-to-clipboard ---
const CopyButton = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        // This is a fallback for environments where navigator.clipboard is not available
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    };
    return (
        <Button onClick={handleCopy} variant="ghost" size="icon" className="h-6 w-6">
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </Button>
    );
};

// --- MAIN COMPONENT ---
export default function DigiPaymentPage() {
    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
        }),
    };

    return (
        <div className="bg-[#11071F] min-h-[calc(100vh-10rem)] text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center mb-8 flex-wrap gap-4"
                >
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Wallet</h1>
                    <Card className="bg-white/10 border-purple-400/30 p-2 px-4">
                        <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-purple-300"/>
                            <div>
                                <p className="font-bold text-sm">{connectedWallet.identityName}</p>
                                <div className="flex items-center gap-1">
                                    <p className="text-xs text-purple-200/70 font-mono">
                                        {`${connectedWallet.principalId.slice(0, 5)}...${connectedWallet.principalId.slice(-3)}`}
                                    </p>
                                    <CopyButton textToCopy={connectedWallet.principalId} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- MAIN CONTENT (LEFT) --- */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
                            <Card className="bg-purple-900/20 border-purple-400/30">
                                <CardHeader>
                                    <CardDescription className="text-purple-300">Portfolio Value</CardDescription>
                                    <CardTitle className="text-4xl sm:text-5xl font-bold">
                                        ${connectedWallet.portfolioValueUSD.toLocaleString()}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex gap-4">
                                    <Button className="bg-white text-black hover:bg-gray-200"><Plus className="mr-2 h-4 w-4" /> Buy / On-Ramp</Button>
                                    <Button variant="secondary">Swap Tokens</Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
                            <Card className="bg-white/5 border-purple-400/20">
                                <Tabs defaultValue="send" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-purple-900/30 border-none">
                                        <TabsTrigger value="send"><Send className="mr-2 h-4 w-4"/>Send</TabsTrigger>
                                        <TabsTrigger value="receive"><QrCode className="mr-2 h-4 w-4"/>Receive</TabsTrigger>
                                        <TabsTrigger value="cycles"><RefreshCw className="mr-2 h-4 w-4"/>Top Up Cycles</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="send" className="p-6 space-y-6">
                                        <h3 className="text-xl font-semibold">Send ICP or ICRC-1 Tokens</h3>
                                        <div>
                                            <Label className="text-sm text-purple-200/80">Recipient's Principal ID</Label>
                                            <Input placeholder="b77a5-d2g6j-..." className="mt-1 font-mono bg-black/20 border-purple-400/30"/>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-purple-200/80">Asset & Amount</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input type="number" placeholder="10.0" className="bg-black/20 border-purple-400/30"/>
                                                <Select defaultValue="icp">
                                                    <SelectTrigger className="w-[150px] bg-black/20 border-purple-400/30"><SelectValue/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="icp">ICP</SelectItem>
                                                        <SelectItem value="ghost">GHOST</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button size="lg" className="w-full mt-2">Review & Sign Transaction</Button>
                                    </TabsContent>
                                     <TabsContent value="receive" className="p-6 text-center">
                                        <h3 className="text-xl font-semibold mb-4">Your Principal ID</h3>
                                        <div className="w-48 h-48 bg-white p-2 mx-auto rounded-lg flex items-center justify-center">
                                           <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(connectedWallet.principalId)}&size=180x180&bgcolor=FFFFFF`} alt="Your Principal ID QR Code" />
                                        </div>
                                        <p className="text-purple-200/70 mt-4 text-xs font-mono break-all">{connectedWallet.principalId}</p>
                                    </TabsContent>
                                    <TabsContent value="cycles" className="p-6 space-y-6">
                                        <h3 className="text-xl font-semibold">Top Up Canister Cycles</h3>
                                        <p className="text-sm text-purple-200/80">Cycles are used to pay for computation and storage on the Internet Computer. Topping up ensures your app's canisters (like DigiDocument) continue to run.</p>
                                        <div>
                                            <Label className="text-sm text-purple-200/80">Canister ID to Top Up</Label>
                                            <Input placeholder="aaaaa-aa..." className="mt-1 font-mono bg-black/20 border-purple-400/30"/>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-purple-200/80">Amount of ICP to Convert</Label>
                                            <Input type="number" placeholder="1.0" className="mt-1 bg-black/20 border-purple-400/30"/>
                                        </div>
                                        <Button size="lg" className="w-full mt-2">Convert & Top Up</Button>
                                    </TabsContent>
                                </Tabs>
                            </Card>
                        </motion.div>
                    </div>

                    {/* --- SIDEBAR (RIGHT) --- */}
                    <div className="space-y-8">
                        <motion.div custom={1.5} initial="hidden" animate="visible" variants={sectionVariants}>
                            <Card className="bg-white/5 border-purple-400/20">
                                <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {connectedWallet.assets.map((asset) => (
                                            <li key={asset.symbol} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10"><img src={asset.logo} alt={asset.name} /></Avatar>
                                                    <div>
                                                        <p className="font-bold">{asset.symbol}</p>
                                                        <p className="text-sm text-purple-200/70">{asset.name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold font-mono">{asset.balance.toLocaleString()}</p>
                                                    <p className="text-sm text-purple-200/70">${asset.usdValue.toLocaleString()}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                        
                        <motion.div custom={2.5} initial="hidden" animate="visible" variants={sectionVariants}>
                            <Card className="bg-white/5 border-purple-400/20">
                                <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {recentTransactions.map((tx, i) => (
                                            <li key={i} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback className={tx.amount.startsWith('-') ? "bg-red-900/70" : "bg-green-900/70"}>
                                                            <tx.icon className="h-4 w-4"/> 
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{tx.type}</p>
                                                        <p className="text-sm text-purple-200/70">{tx.details}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold font-mono ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{tx.amount}</p>
                                                    <p className="text-xs text-purple-400">{tx.time}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
