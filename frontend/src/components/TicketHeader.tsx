"use client";

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Search } from 'lucide-react';
import logo from '../assets/logo.png';

// Import UI components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/seperator';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// DFINITY imports
import { AuthClient } from '@dfinity/auth-client';

const network = process.env.DFX_NETWORK;
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app' // Mainnet
    : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`; // Local

export default function TicketAppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [principalId, setPrincipalId] = useState<string | null>(null);

  // Initialize AuthClient and check authentication status
  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      const authenticated = await client.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const identity = client.getIdentity();
        setPrincipalId(identity.getPrincipal().toText());
      }
    });
  }, []);
  
  // Handle scroll effect to match MainHeader
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipalId(null);
    navigate('/'); // Redirect to landing page after logout
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/events?query=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  // Navigation items for the ticket app
  const navigationItems = [
    { name: 'Dashboard', path: '/home' },
    { name: 'My Tickets', path: '/digiticket' },
    { name: 'Events', path: '/events' },
    { name: 'Marketplace', path: '/marketplace' }
  ];

  const AuthButtons = () => (
    <>
      {isAuthenticated && (
        <div className="flex items-center gap-4">
          <Link to="/postlogin" title="Profile">
            <Avatar>
              <AvatarImage src={`https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?principal=${principalId}`} alt="User Avatar" />
              <AvatarFallback>{principalId ? principalId.substring(0, 2).toUpperCase() : '...'}</AvatarFallback>
            </Avatar>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          scrolled
            ? 'bg-[#2B0B3F]/95 backdrop-blur-lg shadow-purple-900/20 shadow-lg'
            : 'bg-[#2B0B3F]/80 backdrop-blur-sm'
        }`}
      >
        <nav className="container mx-auto flex items-center justify-between p-4 text-white">
          {/* Left Section: Logo and App Name */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/home" className="flex items-center space-x-3 group">
              <img src={logo} alt="DigiPurse Logo" className="h-10 w-10 md:h-12 md:w-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
              <span className="text-2xl md:text-3xl font-bold tracking-tight group-hover:text-purple-300 transition-colors duration-300">
                DigiTicket
              </span>
            </Link>
          </div>

          {/* Right Section: Navigation & Auth (Desktop) */}
          <div className="hidden lg:flex items-center space-x-8 flex-shrink-0">
            <ul className="flex items-center space-x-6">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="font-medium text-purple-200 hover:text-white transition-colors duration-300 pb-1 border-b-2 border-transparent hover:border-purple-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(true)} 
              aria-label="Open menu"
              className="text-white hover:bg-purple-800/50 hover:text-white"
            >
              <Menu className="h-7 w-7" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-xs bg-[#1E0A2E] p-6 text-white shadow-2xl border-l border-purple-400/20">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="text-white hover:bg-purple-800/50 hover:text-white">
                <X className="h-7 w-7" />
              </Button>
            </div>
            
            {/* Search Bar for Mobile */}
            <div className="relative mt-6">
              <Input 
                placeholder="Search events..."
                className="bg-white/5 border-purple-400/30 text-white placeholder:text-purple-300/60 pl-10"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                    setMobileMenuOpen(false);
                  }
                }}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-300/60" />
            </div>

            <Separator className="my-4 bg-purple-200/20" />
            <ul className="mt-4 space-y-2">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="block text-lg font-medium text-purple-200 hover:text-white p-3 rounded-md hover:bg-white/5" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Separator className="my-4 bg-purple-200/20" />
            <div className="w-full">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}
