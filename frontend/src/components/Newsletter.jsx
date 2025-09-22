"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import logo from '../assets/logo.png'; // Make sure this path is correct

export default function NewsletterCard() {
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) return;
        setIsSubscribing(true);
        // Simulate an API call
        setTimeout(() => {
            console.log(`Subscribing ${email}...`);
            setIsSubscribing(false);
            setEmail('');
            // Here you would typically show a success toast message
        }, 1500);
    };

    return (
        <motion.div 
            className="group relative w-full max-w-[120rem] mx-auto overflow-hidden rounded-3xl
                       bg-black/30 backdrop-blur-xl border border-white/10
                       transition-all duration-300 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-900/50"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
        >
            {/* Glossy overlay effect */}
            <div className="absolute top-0 left-0 w-full h-full 
                           bg-gradient-to-br from-purple-900/40 via-fuchsia-900/10 to-transparent
                           opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
            />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 items-center">
                {/* Left Section: Content & Form */}
                <div className="p-20 md:p-36">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 
                            className="text-4xl md:text-6xl font-bold text-white"
                            // --- FIXED: font-family value is now a single string ---
                            style={{ fontFamily: 'AeonikBold, sans-serif' }}
                        >
                            Stay Ahead
                        </h2>
                    </div>
                    <p 
                        className="text-purple-200/80 mb-12 text-lg md:text-xl"
                        // --- FIXED: font-family value is now a single string ---
                        style={{ fontFamily: 'AeonikLight, sans-serif' }}
                    >
                        Subscribe to the DigiPurse newsletter for the latest updates on Web3, exclusive feature releases, and market insights.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                        <Input
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isSubscribing}
                            className="flex-grow bg-black/30 border-purple-400/30 text-white placeholder:text-purple-400/50 
                                focus:border-purple-400 focus:ring-purple-400 h-20 text-lg"
                            // --- FIXED: font-family value is now a single string ---
                            style={{ fontFamily: 'AeonikLight, sans-serif' }}
                        />
                        <Button 
                            type="submit" 
                            disabled={isSubscribing}
                            className="h-20 px-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xl
                                    disabled:bg-purple-800/50"
                            // --- FIXED: font-family value is now a single string ---
                            style={{ fontFamily: 'AeonikBold, sans-serif' }}
                        >
                            {isSubscribing ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                                <>
                                    Subscribe <ArrowRight className="h-8 w-8 ml-3" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Right Section: Logo */}
                <div className="relative h-full hidden md:flex items-center justify-center p-8">
                     {/* Inner glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-tl from-purple-800/50 to-transparent blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <motion.img 
                        src={logo} 
                        alt="DigiPurse Logo" 
                        className="relative w-80 h-80 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6"
                    />
                </div>
            </div>
        </motion.div>
    );
}