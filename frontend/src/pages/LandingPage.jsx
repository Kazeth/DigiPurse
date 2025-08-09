import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createActor, canisterId } from '@/declarations/Registry_backend';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Ticket, FileText } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import logo from '@/assets/logo.png';
import icpLogo from '../assets/icp-logo.png';
import motokoLogo from '../assets/motoko-logo.png';
import digiIdentityImage from '../assets/digi-identity.png';
import digiTicketImage from '../assets/digi-ticket.png';
import digiDocumentImage from '../assets/digi-document.png';

// Feature data
const features = [
  {
    icon: ShieldCheck,
    title: 'DigiIdentity',
    description: 'Utilizes Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs) to enable users to securely manage digital versions of passports, ID cards, and other credentials.',
    image: digiIdentityImage,
  },
  {
    icon: Ticket,
    title: 'DigiTicket',
    description: 'Employs NFT-based tickets to prevent fraud and scalping. Each ticket is unique and traceable on the blockchain, providing transparency and authenticity.',
    image: digiTicketImage,
  },
  {
    icon: FileText,
    title: 'DigiDocument',
    description: 'A decentralized document storage system that allows users to securely upload, view, and manage their files on the blockchain. Ensures data privacy, ownership, and immutability in a trustless environment.',
    image: digiDocumentImage,
  },
];

// Animation variants for fade-in effect
const featureVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { authClient, isAuthenticated, login } = useAuth();

  const handleLogin = async () => {
    if (!authClient) return;
    const status = await login();
    if (status) {
      console.log("User is authenticated and available");
      const identity = authClient.getIdentity();
      const actor = await createActor(canisterId, { agentOptions: { identity } });
      const exist = await actor.checkUserExist(identity.getPrincipal());
      if (exist) {
        navigate('/home');
      } else {
        navigate('/postlogin');
      }
    } else {
      console.error("Authentication failed");
    }
  };

  const goToHome = async () => {
    navigate('/home');
  };

  // Ref for technology section
  const techRef = React.useRef(null);
  const techInView = useInView(techRef, { once: true, threshold: 0.2 });

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
                DigiPurse is a Web3 application designed to streamline digital life by integrating ticketing, identity, and documents into one secure platform, giving you full control.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {isAuthenticated ? (
                  <Button size="lg" onClick={goToHome}>
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleLogin}>
                    Start Now
                  </Button>
                )}
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

      {/* Divider */}
      <hr className="border-t border-purple-900/20 mx-auto w-3/4" />

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
            {features.map((feature, index) => {
              // Create a ref for each feature to track visibility
              const ref = React.useRef(null);
              const isInView = useInView(ref, { once: true, threshold: 0.2 });

              return (
                <motion.div
                  key={feature.title}
                  ref={ref}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  variants={featureVariants}
                  className={`grid grid-cols-1 ${
                    index % 2 === 1 ? 'lg:grid-cols-[55%_45%] lg:grid-flow-col-dense' : 'lg:grid-cols-[45%_55%]'
                  } gap-6 items-center`}
                >
                  {/* Image */}
                  <div
                    className={`flex ${index % 2 === 1 ? 'lg:col-start-2 justify-end' : 'justify-start'}`}
                  >
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="rounded-2xl shadow-2xl shadow-purple-900/20 w-full max-w-xl glow-effect"
                      onError={() => console.error(`Failed to load ${feature.title} image at ${feature.image}`)}
                    />
                  </div>

                  {/* Text */}
                  <div
                    className={`flex flex-col ${
                      index === 1 ? 'text-right items-end' : 'text-left items-start'
                    }`}
                  >
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/10 mb-4">
                      <feature.icon className="h-6 w-6 text-purple-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                    <p className="mt-2 text-purple-200/80">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-t border-purple-900/20 mx-auto w-3/4" />

      {/* Powered by Technology Section */}
      <section id="technology" className="py-20 sm:py-28 bg-[#11071F]">
        <div className="container mx-auto px-6">
          <motion.div
            ref={techRef}
            initial="hidden"
            animate={techInView ? 'visible' : 'hidden'}
            variants={featureVariants}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Powered by Cutting-Edge Technology
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-purple-200/70">
              Built on the Internet Computer for true decentralization, speed, and on-chain data storage.
            </p>
            <div className="mt-10 flex justify-center gap-8">
              <img
                src={icpLogo}
                alt="Internet Computer Logo"
                className="h-16 w-auto"
                onError={() => console.error("Failed to load ICP logo at ../assets/icp-logo.png")}
              />
              <img
                src={motokoLogo}
                alt="Motoko Logo"
                className="h-16 w-auto"
                onError={() => console.error("Failed to load Motoko logo at ../assets/motoko-logo.png")}
              />
            </div>
            {/* Fallback content for debugging */}
            <p className="mt-4 text-sm text-purple-200/50">
              Motoko
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}