import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Target, Users, Rocket, Lightbulb, Code } from 'lucide-react';

// Mock data for team members - now with 4 people
const teamMembers = [
  {
    name: 'Roony Soon',
    role: 'Founder & CEO',
    avatar: 'https://placehold.co/100x100/E9D5FF/4C1D95?text=AJ',
    bio: 'Visionary leader with a passion for decentralization and user empowerment.',
  },
  {
    name: 'Eric Djakaria',
    role: 'Lead Blockchain Developer',
    avatar: 'https://placehold.co/100x100/E9D5FF/4C1D95?text=SL',
    bio: 'Expert in smart contract development and building secure, scalable systems.',
  },
  {
    name: 'Abel Fillio',
    role: 'Head of Product & Design',
    avatar: 'https://placehold.co/100x100/E9D5FF/4C1D95?text=MC',
    bio: 'Dedicated to creating intuitive and beautiful user experiences in Web3.',
  },
  {
    name: 'Martin Erickson',
    role: 'Marketing & Community',
    avatar: 'https://placehold.co/100x100/E9D5FF/4C1D95?text=DK',
    bio: 'Connecting with the community and sharing the DigiPurse vision with the world.',
  }
];

// Core values data
const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'We prioritize the safety of your assets and data above all else, implementing state-of-the-art security measures.'
    },
    {
      icon: Users,
      title: 'User Sovereignty',
      description: 'You are in control. We build tools that empower you to own and manage your digital identity and assets without intermediaries.'
    },
    {
      icon: Target,
      title: 'Simplicity in Design',
      description: 'We believe the power of Web3 should be accessible to everyone. We are committed to making complex technology simple and intuitive.'
    }
];

// Journey steps data - modified to remove years and update the final step
const journeySteps = [
    {
        icon: Lightbulb,
        title: 'The Spark',
        description: 'Frustrated by digital fragmentation, the initial concept for a unified Web3 wallet was born out of a desire for simplicity and ownership.'
    },
    {
        icon: Code,
        title: 'Building the Foundation',
        description: 'The core team assembled, and development began on the secure identity and payment protocols that form the backbone of DigiPurse.'
    },
    {
        icon: Users,
        title: 'Alpha & Community Feedback',
        description: 'We launched our first alpha version to a dedicated group of early adopters, gathering crucial feedback to refine and perfect the user experience.'
    },
    {
        icon: Rocket,
        title: 'The Road Ahead',
        description: 'We are continuously working to add new features, enhance security, and expand our ecosystem to bring the full power of Web3 to your fingertips.'
    }
];

export default function AboutPage() {
  return (
    <div className="bg-[#11071F] text-white">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B0B3F] to-[#11071F] opacity-90"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            About DigiPurse
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-purple-200/80">
            We are on a mission to simplify and secure your digital life by harnessing the power of decentralized technology.
          </p>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Our Journey
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-purple-200/70">
              From a simple idea to a full-fledged platform, here's how we got here.
            </p>
          </div>
          <div className="relative">
            {/* The timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-purple-400/30 hidden md:block"></div>
            
            <div className="space-y-24">
                {journeySteps.map((step, index) => (
                    <div key={step.title} className="relative">
                        {/* Icon - always in the middle */}
                        <div className="md:absolute left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-white/10 flex items-center justify-center z-10 border-4 border-[#11071F] mx-auto mb-4 md:mb-0">
                            <step.icon className="h-10 w-10 text-purple-300" />
                        </div>

                        {/* Content - mobile */}
                        <div className="md:hidden text-center">
                            <h4 className="text-xl font-bold">{step.title}</h4>
                            <p className="mt-2 text-purple-200/80 max-w-sm mx-auto">{step.description}</p>
                        </div>

                        {/* Content - desktop */}
                        <div className="hidden md:flex items-center">
                            {/* Left Side */}
                            <div className="w-1/2 pr-12">
                                {index % 2 === 0 && (
                                    <div className="text-right">
                                        <h4 className="text-xl font-bold">{step.title}</h4>
                                        <p className="mt-2 text-purple-200/80">{step.description}</p>
                                    </div>
                                )}
                            </div>
                            {/* Right Side */}
                            <div className="w-1/2 pl-12">
                                {index % 2 !== 0 && (
                                    <div className="text-left">
                                        <h4 className="text-xl font-bold">{step.title}</h4>
                                        <p className="mt-2 text-purple-200/80">{step.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values Section */}
      <section className="py-20 sm:py-24 bg-purple-900/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Our Core Values
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-purple-200/70">
              The principles that guide every decision we make.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
                <div key={value.title} className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10 mb-4">
                        <value.icon className="h-8 w-8 text-purple-300" />
                    </div>
                    <h3 className="text-xl font-bold">{value.title}</h3>
                    <p className="mt-2 text-purple-200/80">{value.description}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet The Team Section */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Meet The Team
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-purple-200/70">
              The innovators building the future of digital interaction.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="bg-white/5 border-purple-400/20 text-center">
                <CardContent className="pt-6 flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <p className="text-purple-400 font-medium">{member.role}</p>
                  <p className="mt-2 text-sm text-purple-200/80">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
