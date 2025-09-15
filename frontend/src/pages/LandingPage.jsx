import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createActor, canisterId } from '@/declarations/Registry_backend';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ShieldCheck, Ticket, FileText, Coins } from 'lucide-react';
import Marquee from "react-fast-marquee";
import digiIdentityImage from '../assets/digi-identity.png';
import digiTicketImage from '../assets/digi-ticket.png';
import digiDocumentImage from '../assets/digi-document.png';

// Feature data for the hero carousel
const features = [
  { image: digiIdentityImage, title: "DigiIdentity" },
  { image: digiTicketImage, title: "DigiTicket" },
  { image: digiDocumentImage, title: "DigiDocument" },
];

// MODIFIED HERE: Added a unique 'hoverGradientClass' to each feature card
const featureCards = [
  {
    icon: ShieldCheck,
    title: 'DigiIdentity',
    description: 'Securely manage your digital identity with decentralized identifiers and verifiable credentials.',
    gradientClass: 'bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-black/30',
    hoverGradientClass: 'group-hover:from-blue-900/60 group-hover:via-purple-900/50',
  },
  {
    icon: Ticket,
    title: 'DigiTicket',
    description: 'Experience fraud-proof event access with unique, traceable NFT-based tickets on the blockchain.',
    gradientClass: 'bg-gradient-to-br from-fuchsia-900/40 via-purple-900/30 to-black/30',
    hoverGradientClass: 'group-hover:from-fuchsia-900/60 group-hover:via-purple-900/50',
  },
  {
    icon: FileText,
    title: 'DigiDocument',
    description: 'Own your data with our decentralized document storage, ensuring privacy and immutability.',
    gradientClass: 'bg-gradient-to-br from-teal-900/40 via-indigo-900/30 to-black/30',
    hoverGradientClass: 'group-hover:from-teal-900/60 group-hover:via-indigo-900/50',
  },
  {
    icon: Coins,
    title: 'DigiCoin',
    description: 'The native utility token that powers the DigiPurse ecosystem, enabling transactions and governance.',
    gradientClass: 'bg-gradient-to-br from-amber-700/40 via-purple-800/30 to-black/30',
    hoverGradientClass: 'group-hover:from-amber-700/60 group-hover:via-purple-800/50',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { authClient, isAuthenticated, login } = useAuth();

  const handleLogin = async () => {
    if (!authClient) return;
    const status = await login();
    if (status) {
      console.log("User is authenticated and available");
      const identity = authClient.getIdentity();
      const actor = createActor(canisterId, { agentOptions: { identity } });
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

  const goToHome = () => {
    navigate('/home');
  };

  return (
    <div className="bg-black overflow-x-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-fuchsia-900/40 to-black"></div>

      {/* Hero section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 pt-32 md:pt-40 overflow-hidden">
        <div className="w-full max-w-5xl">
          <div>
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5">
              <span className="rounded-full bg-purple-400 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-black">New</span>
              <span className="ml-3 text-sm text-purple-200">Introducing DigiCoin</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
              Your Digital Life,
              <span className="block text-purple-400">Decentralized.</span>
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-lg text-purple-200/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
              DigiPurse integrates your tickets, identity, and documents into one secure Web3 platform.
            </p>
            <div className="mt-10">
              {isAuthenticated ? (
                <Button size="lg" onClick={goToHome} style={{ fontFamily: 'AeonikLight, sans-serif' }}>Go to Dashboard</Button>
              ) : (
                <Button size="lg" onClick={handleLogin} aria-label="Start Now with DigiPurse" style={{ fontFamily: 'AeonikLight, sans-serif' }}>Start Now</Button>
              )}
            </div>
          </div>
        </div>

        <div 
          className="relative z-10 mt-20 w-[calc(100%-2rem)] md:w-[calc(95%-4rem)] lg:w-[calc(80%-4rem)] max-w-7xl mx-auto
                     aspect-video
                     bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl shadow-black/50
                     overflow-hidden 
                     transition-transform duration-300 ease-in-out hover:scale-[1.01] hover:-translate-y-2"
        >
          <Carousel
            opts={{
              loop: true,
            }}
            className="w-full h-full"
          >
            <CarouselContent className="h-full">
              {features.map((feature, index) => (
                <CarouselItem key={index} className="h-full relative">
                  {/* Background Image (Blurred and Darkened) */}
                  <img
                    src={feature.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 brightness-50"
                  />
                  {/* Foreground Image (Clear and Contained) */}
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="relative w-full h-full object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Marquee section */}
      <section className="relative z-10 mt-16 md:mt-24 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
            Our Features
          </h2>
        </div>

        <Marquee 
          pauseOnHover={true} 
          speed={40} 
          gradient={true}
          gradientColor={[17, 7, 31]}
          gradientWidth={100}
        >
          {[...featureCards, ...featureCards].map((feature, index) => (
            // MODIFIED HERE: Added the dynamic hover gradient class
            <div 
              key={index} 
              className={`group relative mx-4 flex w-[480px] h-[600px] flex-col 
                         rounded-3xl border border-white/10 p-8 backdrop-blur-sm
                         transition-all duration-300 ease-in-out
                         hover:z-20 group-hover:w-[600px] group-hover:h-[750px]
                         group-hover:-translate-y-4 group-hover:scale-105
                         ${feature.gradientClass} ${feature.hoverGradientClass}`} // Hover class is now applied here
            >
              <div className="relative z-10 flex-grow flex items-center justify-center">
                <feature.icon className="h-32 w-32 text-purple-400/80 transition-colors duration-300 group-hover:text-purple-400" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'AeonikBold, sans-serif' }}>
                  {feature.title}
                </h3>
                <p className="text-lg text-purple-200/80" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </Marquee>
      </section>
    </div>
  );
}