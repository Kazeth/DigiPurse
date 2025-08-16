import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowUpRight, ArrowDownLeft, Send, QrCode, Plus, Repeat, Wallet, Copy, Check, Ticket, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';
import { createActor, canisterId as PAYMENT_CANISTER_ID } from '@/declarations/Payment_backend';
import { createActor as createRegistryActor, canisterId as REGISTRY_CANISTER_ID } from '@/declarations/Registry_backend';
import toast, { Toaster } from 'react-hot-toast';

// Hardcoded ledger IDs (replace GHOST with actual ID or fetch dynamically)
const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai'; // Mainnet ICP ledger
const GHOST_LEDGER_CANISTER_ID = 'your-ghost-ledger-canister-id'; // Replace with actual or mock GHOST ledger ID

// Mock wallet for unauthenticated state
const mockWallet = {
    principalId: 'b77a5-d2g6j-l4g7b-a5b7g-6g6a5-d2g6j-l4g7b-a5b7g-cai',
    identityName: 'roony.icp',
    portfolioValueUSD: 8540.50,
    assets: [
        { symbol: 'ICP', name: 'Internet Computer', balance: 500.25, usdValue: 8004.00, logo: 'https://cryptologos.cc/logos/internet-computer-icp-logo.png' },
        { symbol: 'GHOST', name: 'Ghost Token', balance: 10000, usdValue: 536.50, logo: 'https://assets.coingecko.com/coins/images/18523/standard/ghost.png' },
    ],
};

// CopyButton component
const CopyButton = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Failed to copy text:', err);
            toast.error('Failed to copy');
        }
        document.body.removeChild(textArea);
    };
    return (
        <Button onClick={handleCopy} variant="ghost" size="icon" className="h-6 w-6">
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </Button>
    );
};

// Main component
export default function DigiPaymentPage() {
    const [authClient, setAuthClient] = useState(null);
    const [actor, setActor] = useState(null);
    // const [registryActor, setRegistryActor] = useState(null); // Uncomment for Registry.mo
    const [principal, setPrincipal] = useState(null);
    const [wallet, setWallet] = useState(mockWallet);
    const [sendForm, setSendForm] = useState({ recipient: '', amount: '', token: 'icp', subaccount: '' });
    const [topUpForm, setTopUpForm] = useState({ canisterId: '', amount: '' });
    const [transactions, setTransactions] = useState([]);
    const [prices, setPrices] = useState({ icp: 5.39, ghost: 0.048 }); // Initial prices (Aug 16, 2025)
    const [isLoading, setIsLoading] = useState(false);

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
        }),
    };

    // Initialize authentication and fetch prices
    useEffect(() => {
        async function initialize() {
            try {
                const client = await AuthClient.create();
                setAuthClient(client);
                if (await client.isAuthenticated()) {
                    await setupActors(client);
                }
            } catch (error) {
                console.error('Initialization failed:', error);
                toast.error('Initialization failed: ' + error.message);
            }

            // Fetch token prices from CoinGecko
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=internet-computer,ghost&vs_currencies=usd');
                const data = await response.json();
                setPrices({
                    icp: data['internet-computer']?.usd || 5.39,
                    ghost: data.ghost?.usd || 0.048,
                });
            } catch (error) {
                console.error('Failed to fetch prices:', error);
                toast.error('Failed to fetch token prices');
            }
        }
        initialize();
    }, []);

    // Setup actors and fetch initial data
    const setupActors = async (client) => {
        try {
            const identity = client.getIdentity();
            const agent = new HttpAgent({ identity });
            if (process.env.NODE_ENV !== 'production') {
                await agent.fetchRootKey();
            }
            const paymentActor = createActor(PAYMENT_CANISTER_ID, {
                agentOptions: { identity },
            });
            setActor(paymentActor);
            setPrincipal(identity.getPrincipal());

            // Uncomment for Registry.mo integration
            /*
            const registryActor = createActor(REGISTRY_CANISTER_ID, {
                agentOptions: { identity },
            });
            setRegistryActor(registryActor);
            // Optionally fetch GHOST_LEDGER_CANISTER_ID from Registry.mo
            // const ghostLedgerId = await registryActor.getGhostLedgerId();
            */

            // Fetch balances
            const icpBalance = await paymentActor.getMyBalance(ICP_LEDGER_CANISTER_ID);
            const ghostBalance = await paymentActor.getMyBalance(GHOST_LEDGER_CANISTER_ID);
            const newWallet = {
                principalId: identity.getPrincipal().toText(),
                identityName: mockWallet.identityName,
                portfolioValueUSD: (Number(icpBalance) / 1e8 * prices.icp) + (Number(ghostBalance) / 1e8 * prices.ghost),
                assets: [
                    { symbol: 'ICP', name: 'Internet Computer', balance: Number(icpBalance) / 1e8, usdValue: Number(icpBalance) / 1e8 * prices.icp, logo: mockWallet.assets[0].logo },
                    { symbol: 'GHOST', name: 'Ghost Token', balance: Number(ghostBalance) / 1e8, usdValue: Number(ghostBalance) / 1e8 * prices.ghost, logo: mockWallet.assets[1].logo },
                ],
            };
            setWallet(newWallet);

            // Fetch transaction history from Payment.mo
            try {
                const txs = await paymentActor.getTransactionHistory();
                setTransactions(txs.map(tx => ({
                    type: tx.method === 'token_transfer' ? (Principal.fromText(tx.buyer).toText() === identity.getPrincipal().toText() ? 'Receive' : 'Send') : tx.method,
                    details: `To/From ${Principal.fromText(tx.buyer).toText() === identity.getPrincipal().toText() ? tx.seller : tx.buyer}`,
                    amount: (Principal.fromText(tx.buyer).toText() === identity.getPrincipal().toText() ? '+' : '-') + (Number(tx.price) / 1e8).toFixed(2) + (tx.ticketID ? ' GHOST' : ' ICP'),
                    time: new Date(Number(tx.timestamp) / 1e6).toLocaleString(),
                    icon: tx.method === 'token_transfer' ? (Principal.fromText(tx.buyer).toText() === identity.getPrincipal().toText() ? ArrowDownLeft : ArrowUpRight) : (tx.ticketID ? Ticket : FileText),
                })));
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
                toast.error('Failed to fetch transaction history');
            }

            // Uncomment for Registry.mo transaction integration
            /*
            try {
                const registryTxs = await registryActor.getAllTransactions();
                const combinedTxs = [...txs, ...registryTxs].map(tx => ({
                    type: tx.method === 'transfer' ? 'Transfer' : tx.method === 'purchase' ? 'Purchase' : tx.method,
                    details: `Ticket ${tx.ticketID} ${tx.method === 'purchase' ? 'for event' : 'to/from'} ${tx.buyer === identity.getPrincipal().toText() ? tx.seller : tx.buyer}`,
                    amount: (tx.buyer === identity.getPrincipal().toText() ? '+' : '-') + (Number(tx.price) / 1e8).toFixed(2) + ' ICP',
                    time: new Date(Number(tx.timestamp) / 1e6).toLocaleString(),
                    icon: Ticket,
                }));
                setTransactions(combinedTxs);
            } catch (error) {
                console.error('Failed to fetch registry transactions:', error);
                toast.error('Failed to fetch registry transactions');
            }
            */
        } catch (error) {
            console.error('Actor setup failed:', error);
            toast.error('Failed to setup actor: ' + error.message);
        }
    };

    // Handle login
    const handleLogin = async () => {
        if (!authClient) return;
        setIsLoading(true);
        try {
            await authClient.login({
                identityProvider: process.env.NODE_ENV === 'production'
                    ? 'https://identity.ic0.app/#authorize'
                    : 'http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai',
                onSuccess: async () => {
                    await setupActors(authClient);
                    toast.success('Login successful');
                    setIsLoading(false);
                },
            });
        } catch (error) {
            console.error('Login failed:', error);
            toast.error('Login failed: ' + error.message);
            setIsLoading(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        if (!authClient) return;
        setIsLoading(true);
        try {
            await authClient.logout();
            setActor(null);
            // setRegistryActor(null); // Uncomment for Registry.mo
            setPrincipal(null);
            setWallet(mockWallet);
            setTransactions([]);
            toast.success('Logged out');
            setIsLoading(false);
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed: ' + error.message);
            setIsLoading(false);
        }
    };

    // Handle send tokens
    const handleSend = async () => {
        if (!actor || !principal) {
            toast.error('Please log in first');
            return;
        }
        if (!sendForm.recipient || !sendForm.amount) {
            toast.error('Recipient and amount are required');
            return;
        }
        if (Number(sendForm.amount) <= 0) {
            toast.error('Amount must be greater than zero');
            return;
        }
        try {
            Principal.fromText(sendForm.recipient); // Validate recipient
        } catch {
            toast.error('Invalid recipient Principal');
            return;
        }
        setIsLoading(true);
        try {
            const canisterId = sendForm.token === 'icp' ? ICP_LEDGER_CANISTER_ID : GHOST_LEDGER_CANISTER_ID;
            const amount = BigInt(Math.floor(Number(sendForm.amount) * 1e8)); // Convert to e8s
            const recipient = Principal.fromText(sendForm.recipient);
            const subaccount = sendForm.subaccount ? Array.from(Buffer.from(Uint8Array.from(Buffer.from(sendForm.subaccount, 'hex')))) : null;
            const result = await actor.sendTokens(canisterId, recipient, amount, subaccount);
            if ('ok' in result) {
                toast.success(`Transaction successful: Block ${result.ok}`);
                // Update balances
                const icpBalance = await actor.getMyBalance(ICP_LEDGER_CANISTER_ID);
                const ghostBalance = await actor.getMyBalance(GHOST_LEDGER_CANISTER_ID);
                setWallet({
                    ...wallet,
                    portfolioValueUSD: (Number(icpBalance) / 1e8 * prices.icp) + (Number(ghostBalance) / 1e8 * prices.ghost),
                    assets: [
                        { ...wallet.assets[0], balance: Number(icpBalance) / 1e8, usdValue: Number(icpBalance) / 1e8 * prices.icp },
                        { ...wallet.assets[1], balance: Number(ghostBalance) / 1e8, usdValue: Number(ghostBalance) / 1e8 * prices.ghost },
                    ],
                });
                // Refresh transactions
                const txs = await actor.getTransactionHistory();
                setTransactions(txs.map(tx => ({
                    type: tx.method === 'token_transfer' ? (Principal.fromText(tx.buyer).toText() === principal.toText() ? 'Receive' : 'Send') : tx.method,
                    details: `To/From ${Principal.fromText(tx.buyer).toText() === principal.toText() ? tx.seller : tx.buyer}`,
                    amount: (Principal.fromText(tx.buyer).toText() === principal.toText() ? '+' : '-') + (Number(tx.price) / 1e8).toFixed(2) + (tx.ticketID ? ' GHOST' : ' ICP'),
                    time: new Date(Number(tx.timestamp) / 1e6).toLocaleString(),
                    icon: tx.method === 'token_transfer' ? (Principal.fromText(tx.buyer).toText() === principal.toText() ? ArrowDownLeft : ArrowUpRight) : (tx.ticketID ? Ticket : FileText),
                })));
            } else {
                toast.error('Transaction failed: ' + result.err);
            }
        } catch (error) {
            console.error('Send failed:', error);
            toast.error('Send failed: ' + error.message);
        }
        setIsLoading(false);
    };

    // Handle top up cycles
    const handleTopUp = async () => {
        if (!actor || !principal) {
            toast.error('Please log in first');
            return;
        }
        if (!topUpForm.canisterId || !topUpForm.amount) {
            toast.error('Canister ID and amount are required');
            return;
        }
        if (Number(topUpForm.amount) <= 0) {
            toast.error('Amount must be greater than zero');
            return;
        }
        try {
            Principal.fromText(topUpForm.canisterId); // Validate canister ID
        } catch {
            toast.error('Invalid canister ID');
            return;
        }
        setIsLoading(true);
        try {
            const canisterId = Principal.fromText(topUpForm.canisterId);
            const amount = BigInt(Math.floor(Number(topUpForm.amount) * 1e8)); // Convert to e8s
            const result = await actor.topUpCanister(canisterId, amount);
            if ('ok' in result) {
                toast.success('Top-up successful: ' + result.ok);
                // Update ICP balance
                const icpBalance = await actor.getMyBalance(ICP_LEDGER_CANISTER_ID);
                setWallet({
                    ...wallet,
                    portfolioValueUSD: (Number(icpBalance) / 1e8 * prices.icp) + (Number(wallet.assets[1].balance) * prices.ghost),
                    assets: [
                        { ...wallet.assets[0], balance: Number(icpBalance) / 1e8, usdValue: Number(icpBalance) / 1e8 * prices.icp },
                        wallet.assets[1],
                    ],
                });
            } else {
                toast.error('Top-up failed: ' + result.err);
            }
        } catch (error) {
            console.error('Top-up failed:', error);
            toast.error('Top-up failed: ' + error.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-[#11071F] min-h-[calc(100vh-10rem)] text-white p-4 sm:p-6 lg:p-8">
            <Toaster position="top-right" />
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
                                <p className="font-bold text-sm">{wallet.identityName}</p>
                                <div className="flex items-center gap-1">
                                    <p className="text-xs text-purple-200/70 font-mono">
                                        {principal ? `${principal.toText().slice(0, 5)}...${principal.toText().slice(-3)}` : wallet.principalId.slice(0, 5) + '...' + wallet.principalId.slice(-3)}
                                    </p>
                                    <CopyButton textToCopy={principal ? principal.toText() : wallet.principalId} />
                                </div>
                            </div>
                            {principal ? (
                                <Button onClick={handleLogout} disabled={isLoading} className="ml-4">
                                    {isLoading ? 'Processing...' : 'Logout'}
                                </Button>
                            ) : (
                                <Button onClick={handleLogin} disabled={isLoading} className="ml-4">
                                    {isLoading ? 'Processing...' : 'Login'}
                                </Button>
                            )}
                        </div>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
                            <Card className="bg-purple-900/20 border-purple-400/30">
                                <CardHeader>
                                    <CardDescription className="text-purple-300">Portfolio Value</CardDescription>
                                    <CardTitle className="text-4xl sm:text-5xl font-bold">
                                        ${wallet.portfolioValueUSD.toLocaleString()}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex gap-4">
                                    <Button className="bg-white text-black hover:bg-gray-200" disabled={isLoading}>
                                        <Plus className="mr-2 h-4 w-4" /> Buy / On-Ramp
                                    </Button>
                                    <Button variant="secondary" disabled={isLoading}>Swap Tokens</Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
                            <Card className="bg-white/5 border-purple-400/20">
                                <Tabs defaultValue="send" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-purple-900/30 border-none">
                                        <TabsTrigger value="send"><Send className="mr-2 h-4 w-4"/>Send</TabsTrigger>
                                        <TabsTrigger value="receive"><QrCode className="mr-2 h-4 w-4"/>Receive</TabsTrigger>
                                        <TabsTrigger value="cycles"><Repeat className="mr-2 h-4 w-4"/>Top Up Cycles</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="send" className="p-6 space-y-6">
                                        <h3 className="text-xl font-semibold">Send ICP or ICRC-1 Tokens</h3>
                                        <div>
                                            <Label className="text-sm text-purple-200/80">Recipient's Principal ID</Label>
                                            <Input
                                                placeholder="b77a5-d2g6j-..."
                                                className="mt-1 font-mono bg-black/20 border-purple-400/30"
                                                value={sendForm.recipient}
                                                onChange={(e) => setSendForm({ ...sendForm, recipient: e.target.value })}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm text-purple-200/80">Subaccount (Optional, Hex)</Label>
                                            <Input
                                                placeholder="e.g., 1a2b3c..."
                                                className="mt-1 font-mono bg-black/20 border-purple-400/30"
                                                value={sendForm.subaccount}
                                                onChange={(e) => setSendForm({ ...sendForm, subaccount: e.target.value })}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm text-purple-200/80">Asset & Amount</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input
                                                    type="number"
                                                    placeholder="10.0"
                                                    className="bg-black/20 border-purple-400/30"
                                                    value={sendForm.amount}
                                                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                                                    disabled={isLoading}
                                                />
                                                <Select
                                                    value={sendForm.token}
                                                    onValueChange={(value) => setSendForm({ ...sendForm, token: value })}
                                                    disabled={isLoading}
                                                >
                                                    <SelectTrigger className="w-[150px] bg-black/20 border-purple-400/30">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="icp">ICP</SelectItem>
                                                        <SelectItem value="ghost">GHOST</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button size="lg" className="w-full mt-2" onClick={handleSend} disabled={isLoading}>
                                            {isLoading ? 'Processing...' : 'Review & Sign Transaction'}
                                        </Button>
                                    </TabsContent>
                                    <TabsContent value="receive" className="p-6 text-center">
                                        <h3 className="text-xl font-semibold mb-4">Your Principal ID</h3>
                                        <div className="w-48 h-48 bg-white p-2 mx-auto rounded-lg flex items-center justify-center">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(principal ? principal.toText() : wallet.principalId)}&size=180x180&bgcolor=FFFFFF`}
                                                alt="Your Principal ID QR Code"
                                            />
                                        </div>
                                        <p className="text-purple-200/70 mt-4 text-xs font-mono break-all">
                                            {principal ? principal.toText() : wallet.principalId}
                                        </p>
                                    </TabsContent>
                                    <TabsContent value="cycles" className="p-6 space-y-6">
                                        <h3 className="text-xl font-semibold">Top Up Canister Cycles</h3>
                                        <p className="text-sm text-purple-200/80">
                                            Cycles are used to pay for computation and storage on the Internet Computer. Topping up ensures your app's canisters (like DigiDocument) continue to run.
                                        </p>
                                        <div>
                                            <Label className="text-sm text-purple-200/80">Canister ID to Top Up</Label>
                                            <Input
                                                placeholder="aaaaa-aa..."
                                                className="mt-1 font-mono bg-black/20 border-purple-400/30"
                                                value={topUpForm.canisterId}
                                                onChange={(e) => setTopUpForm({ ...topUpForm, canisterId: e.target.value })}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm text-purple-200/80">Amount of ICP to Convert</Label>
                                            <Input
                                                type="number"
                                                placeholder="1.0"
                                                className="mt-1 bg-black/20 border-purple-400/30"
                                                value={topUpForm.amount}
                                                onChange={(e) => setTopUpForm({ ...topUpForm, amount: e.target.value })}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <Button size="lg" className="w-full mt-2" onClick={handleTopUp} disabled={isLoading}>
                                            {isLoading ? 'Processing...' : 'Convert & Top Up'}
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="space-y-8">
                        <motion.div custom={1.5} initial="hidden" animate="visible" variants={sectionVariants}>
                            <Card className="bg-white/5 border-purple-400/20">
                                <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {wallet.assets.map((asset) => (
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
                                        {transactions.map((tx, i) => (
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
                                                    <p className={`font-bold font-mono ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                                        {tx.amount}
                                                    </p>
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