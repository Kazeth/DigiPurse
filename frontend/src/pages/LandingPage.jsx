import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createActor, canisterId } from '@/declarations/Registry_backend';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ShieldCheck, Ticket, FileText } from 'lucide-react';
import digiIdentityImage from '../assets/digi-identity.png';
import digiTicketImage from '../assets/digi-ticket.png';
import digiDocumentImage from '../assets/digi-document.png';

// Feature data
const features = [
  {
    icon: ShieldCheck,
    title: 'DigiIdentity',
    description: 'Utilizes Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs)...',
    image: digiIdentityImage,
  },
  {
    icon: Ticket,
    title: 'DigiTicket',
    description: 'Employs NFT-based tickets to prevent fraud and scalping...',
    image: digiTicketImage,
  },
  {
    icon: FileText,
    title: 'DigiDocument',
    description: 'A decentralized document storage system for secure file management...',
    image: digiDocumentImage,
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
    <div className="bg-black overflow-x-hidden">
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 py-32 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-fuchsia-900/40 to-black"></div>
        
        <div className="relative z-10 w-full max-w-5xl">
          <div>
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5">
              <span className="rounded-full bg-purple-400 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-black">
                New
              </span>
              <span className="ml-3 text-sm text-purple-200">
                Introducing DigiCoin
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white"
              style={{ fontFamily: 'AeonikBold, sans-serif' }}
            >
              Your Digital Life,
              <span className="block text-purple-400">Decentralized.</span>
            </h1>
            <p
              className="mt-6 max-w-xl mx-auto text-lg text-purple-200/80"
              style={{ fontFamily: 'AeonikLight, sans-serif' }}
            >
              DigiPurse integrates your tickets, identity, and documents into one secure Web3 platform.
            </p>
            <div className="mt-10">
              {isAuthenticated ? (
                <Button size="lg" onClick={goToHome} style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                  Go to Dashboard
                </Button>
              ) : (
                <Button size="lg" onClick={handleLogin} aria-label="Start Now with DigiPurse" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                  Start Now
                </Button>
              )}
            </div>
          </div>

          <div 
            className="mt-20 w-full max-w-[calc(100%-2rem)] mx-auto lg:max-w-[calc(100%-4rem)] // Reduced gap for larger width
                       h-[40rem] md:h-[50rem] // Significantly larger height
                       bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl shadow-black/50
                       overflow-hidden 
                       transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:-translate-y-2"
          >
            <Carousel
              opts={{
                loop: true,
              }}
              className="w-full h-full"
            >
              <CarouselContent className="h-full">
                {features.map((feature, index) => (
                  <CarouselItem key={index} className="h-full flex items-center justify-center">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </section>
    </div>
  );
}