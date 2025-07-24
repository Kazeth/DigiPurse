import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useUser } from '@/lib/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Ticket, CreditCard } from 'lucide-react';
import logo from '@/assets/logo.png';

// Feature data
const features = [
  {
    icon: ShieldCheck,
    title: 'DigiPurse : IAM',
    description: 'Utilizes Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs) to enable users to securely manage digital versions of passports, ID cards, and other credentials.',
    image: 'https://placehold.co/600x400/4C1D95/FFFFFF?text=Identity',
  },
  {
    icon: Ticket,
    title: 'DigiPurse : Ticket',
    description: 'Employs NFT-based tickets to prevent fraud and scalping. Each ticket is unique and traceable on the blockchain, providing transparency and authenticity.',
    image: 'https://placehold.co/600x400/4C1D95/FFFFFF?text=Tickets',
  },
  {
    icon: CreditCard,
    title: 'DigiPurse : Wallet',
    description: 'Facilitates peer-to-peer transactions with enhanced security and reduced fees. Blockchain integration ensures fast, transparent, and tamper-proof payment processing.',
    image: 'https://placehold.co/600x400/4C1D95/FFFFFF?text=Payments',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { authClient, isAuthenticated, login, principal } = useAuth();
  const { registry } = useUser();

  const handleLogin = async () => {
    if (!authClient) return;
    const success = await login();
    if (success) {
      console.log("User is authenticated and available");
      if (await registry.checkUserExist(principal)) {
        console.log("User is registered, navigating to home page");
        navigate('/home');
      }
      else {
        console.log("User is not registered, navigating to post-login page");
        navigate('/postlogin');
      }
    } else {
      console.error("Authentication failed");
    }
  };

  const goToHome = async () => {
    navigate('/home');
  }

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B0B3F] to-[#11071F] opacity-80"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white">
                Your Digital Life,
                <span className="block text-purple-400">Decentralized.</span>
              </h1>
              <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-purple-200/80">
                DigiPurse is a Web3 application designed to streamline digital life by integrating ticketing, identity, and payments into one secure platform, giving you full control.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {isAuthenticated ?
                  <Button size="lg" onClick={goToHome}>
                    Go to Dashboard
                  </Button>
                  :
                  <Button size="lg" onClick={handleLogin}>
                    Start Now
                  </Button>
                }

                <Button size="lg" variant="secondary">
                  Learn More
                </Button>
              </div>
            </div>
            {/* Image Content */}
            <div className="flex items-center justify-center">
              <img
                src={logo}
                alt="DigiPurse Digital Purse"
                className="w-64 h-64 md:w-80 md:h-80 animate-pulse-slow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-[#11071F]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Everything You Need in One Purse
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-purple-200/70">
              From verifying your identity to accessing events, DigiPurse simplifies your digital interactions.
            </p>
          </div>
          <div className="space-y-20">
            {features.map((feature, index) => (
              <div key={feature.title} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Image */}
                <div className={`flex justify-center ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <img src={feature.image} alt={feature.title} className="rounded-2xl shadow-2xl shadow-purple-900/20 w-full max-w-md" />
                </div>
                {/* Text */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/10 mb-4">
                    <feature.icon className="h-6 w-6 text-purple-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                  <p className="mt-2 text-purple-200/80">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
