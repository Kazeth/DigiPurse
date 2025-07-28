import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Target, Users, Rocket, Lightbulb, Code, FileText, Ticket } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Mock data for team members
const teamMembers = [
  {
    name: 'Roony Soon',
    role: 'Founder & CEO',
    avatar: 'https://placehold.co/100x100/E9D5FF/4C1D95?text=RS',
    bio: 'Visionary leader with a passion for decentralization and user empowerment.',
    github: 'https://github.com/Kazeth',
  },
  {
    name: 'Eric Djakaria',
    role: 'Lead Blockchain Developer',
    avatar: 'https://placehold.co/100x100/E9D5FF/4C1D95?text=ED',
    bio: 'Expert in smart contract development and building secure, scalable systems.',
    github: 'https://github.com/Austrooo',
  },
  {
    name: 'Abel Fillio',
    role: 'Head of Product & Design',
    avatar: 'https://placehold.co/100x100/E9D5FF/4C1D95?text=AF',
    bio: 'Dedicated to creating intuitive and beautiful user experiences in Web3.',
    github: 'https://github.com/abeliooo',
  },
  {
    name: 'Martin Erickson',
    role: 'Marketing & Community',
    avatar: 'https://placehold.co/100x100/E9D5FF/4C1D95?text=ME',
    bio: 'Connecting with the community and sharing the DigiPurse vision with the world.',
    github: 'https://github.com/MisMoela',
  },
];

// Core values data
const values = [
  {
    icon: Shield,
    title: 'Security First',
    description: 'We prioritize the safety of your assets and data above all else, implementing state-of-the-art security measures.',
  },
  {
    icon: Users,
    title: 'User Sovereignty',
    description: 'You are in control. We build tools that empower you to own and manage your digital identity and assets without intermediaries.',
  },
  {
    icon: Target,
    title: 'Simplicity in Design',
    description: 'We believe the power of Web3 should be accessible to everyone. We are committed to making complex technology simple and intuitive.',
  },
];

// Journey steps data
const journeySteps = [
  {
    icon: Lightbulb,
    title: 'The Spark',
    description: 'Frustrated by digital fragmentation, the initial concept for a unified Web3 wallet was born out of a desire for simplicity and ownership.',
  },
  {
    icon: Code,
    title: 'Building the Foundation',
    description: 'The core team assembled, and development began on the secure identity and payment protocols that form the backbone of DigiPurse.',
  },
  {
    icon: Users,
    title: 'Alpha & Community Feedback',
    description: 'We launched our first alpha version to a dedicated group of early adopters, gathering crucial feedback to refine and perfect the user experience.',
  },
  {
    icon: Rocket,
    title: 'The Road Ahead',
    description: 'We are continuously working to add new features, enhance security, and expand our ecosystem to bring the full power of Web3 to your fingertips.',
  },
];

// Data for Hero Cards
const heroFeatures = [
  { icon: Shield, title: 'DigiIdentity', description: 'Conduct safe and secure identity based storage with Optical Character Recognition (OCR) to automatically scan and populate your data to its fields.' },
  { icon: FileText, title: 'DigiDocument', description: 'Utilize secure, document-based storage to manage digital versions of your essential documents in any kind of format, giving you unparalleled privacy and control over your data' },
  { icon: Ticket, title: 'DigiTicket', description: 'Access events with confidence through our NFT-based ticketing system, which eliminates fraud and scalping by making every ticket unique and traceable on the blockchain' },
];

// Reusable Animated Section Component
function AnimatedSection({ children, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`py-20 sm:py-24 ${className}`}
    >
      {children}
    </motion.section>
  );
}

// New component for individual timeline items
function TimelineItem({ step, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const content = (
    <div className="md:w-5/12">
      <h4 className="text-xl font-bold text-white">{step.title}</h4>
      <p className="mt-2 text-purple-200/80">{step.description}</p>
    </div>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      <div className={`flex flex-col md:flex-row items-center md:justify-between ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
        {content}
        <div className="absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0 flex-shrink-0 my-6 md:my-0">
          <div className="w-20 h-20 rounded-full bg-[#11071F] flex items-center justify-center z-10 border-4 border-purple-500/50 relative">
            <step.icon className="h-8 w-8 text-purple-300" />
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-50"></span>
          </div>
        </div>
        <div className="md:w-5/12" /> {/* Spacer div for alignment */}
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, amount: 0.2 });

  const valuesRef = useRef(null);
  const valuesInView = useInView(valuesRef, { once: true, amount: 0.2 });

  const teamRef = useRef(null);
  const teamInView = useInView(teamRef, { once: true, amount: 0.2 });

  return (
    <div className="bg-[#11071F] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B0B3F] to-[#11071F] opacity-90"></div>
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 50 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="container mx-auto px-6 relative z-10"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            About DigiPurse
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-purple-200/80">
            We are on a mission to simplify and secure your digital life by harnessing the power of decentralized technology.
          </p>
          {/* Feature Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {heroFeatures.map((feature) => (
                <Card key={feature.title} className="bg-white/5 border-purple-400/20 text-center p-8 backdrop-blur-sm flex flex-col items-center min-h-88">
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-white/10 mb-6">
                    <feature.icon className="h-10 w-10 text-purple-300" />
                  </div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="mt-4 text-lg text-purple-200/80 flex-grow">{feature.description}</p>
                </Card>
              ))}
            </div>
        </motion.div>
      </section>

      {/* Our Journey Section */}
      <AnimatedSection>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Our Journey</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-purple-200/70">From a simple idea to a full-fledged platform, here's how we got here.</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-purple-400/30 hidden md:block"></div>
            <div className="space-y-16">
              {journeySteps.map((step, index) => (
                <div key={step.title} className="relative">
                  {/* Desktop View */}
                  <div className="hidden md:flex items-center">
                    <div className="w-1/2 pr-14 text-right">
                      {index % 2 === 0 && (
                        <div>
                          <h4 className="text-xl font-bold">{step.title}</h4>
                          <p className="mt-2 text-purple-200/80">{step.description}</p>
                        </div>
                      )}
                    </div>
                    <div className="w-24 h-24 rounded-full bg-[#11071F] flex-shrink-0 flex items-center justify-center z-10 border-4 border-purple-400/30 mx-auto">
                      <step.icon className="h-10 w-10 text-purple-300" />
                    </div>
                    <div className="w-1/2 pl-14 text-left">
                      {index % 2 !== 0 && (
                        <div>
                          <h4 className="text-xl font-bold">{step.title}</h4>
                          <p className="mt-2 text-purple-200/80">{step.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Mobile View */}
                  <div className="md:hidden text-center">
                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center z-10 border-4 border-purple-400/30 mx-auto mb-4">
                      <step.icon className="h-10 w-10 text-purple-300" />
                    </div>
                    <h4 className="text-xl font-bold">{step.title}</h4>
                    <p className="mt-2 text-purple-200/80 max-w-sm mx-auto">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Our Values Section */}
      <section ref={valuesRef} className="py-20 sm:py-24 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Our Core Values</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-purple-200/70">The principles that guide every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: valuesInView ? 1 : 0, y: valuesInView ? 0 : 20 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Card className="bg-white/5 border border-purple-400/20 text-center p-8 group hover:bg-white/10 hover:border-purple-400/80 transition-all duration-300 h-full">
                  <div className="flex justify-center mb-5">
                    <div className="flex items-center justify-center h-20 w-20 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 group-hover:scale-110 transition-all duration-300">
                      <value.icon className="h-9 w-9 text-purple-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{value.title}</h3>
                  <p className="mt-2 text-purple-200/80">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Open Source Section */}
      <AnimatedSection>
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 p-10 rounded-2xl text-center border border-purple-400/30">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Join Our Community</h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-purple-200/80">
              DigiPurse is built on the principles of open source and community collaboration. We welcome you to review our code, contribute, and help us build a better digital future.
            </p>
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200"><a href="https://github.com/Kazeth/DigiPurse" target="_blank" rel="noopener noreferrer">View on GitHub</a></Button>
              <Button asChild size="lg" variant="secondary"><a href="#" target="_blank" rel="noopener noreferrer">Join our Discord</a></Button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Meet The Team Section */}
      <section ref={teamRef} className="py-20 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Meet The Team</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-purple-200/70">The innovators building the future of digital interaction.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: teamInView ? 1 : 0, y: teamInView ? 0 : 20 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Card className="bg-white/5 border-purple-400/20 text-center overflow-hidden group hover:-translate-y-2 transition-all duration-300 h-full">
                  <CardContent className="pt-8 flex flex-col items-center">
                    <Avatar className="h-28 w-28 mb-4 border-4 border-purple-500/30 group-hover:border-purple-400/80 transition-colors duration-300">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-purple-400 font-medium">{member.role}</p>
                    <p className="mt-3 text-sm text-purple-200/80">{member.bio}</p>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 text-purple-400 hover:text-purple-300 underline text-sm"
                    >
                      GitHub Profile
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}