"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import { useAuth } from '@/lib/AuthContext';

export default function TicketAppHeader() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // --- NEW: Added state for hide-on-scroll behavior ---
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Authentication State 
  const { isAuthenticated, principal, logout } = useAuth();

  // --- MODIFIED: Upgraded scroll handler to manage visibility ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false); // Hide on scroll down
      } else {
        setHeaderVisible(true); // Show on scroll up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/home' },
    { name: 'My Tickets', path: '/digiticket' },
    { name: 'Events', path: '/events' },
    { name: 'Marketplace', path: '/marketplace' },
  ];
  
  const navLinkClasses = "font-medium text-purple-200 hover:text-white transition-colors duration-300 pb-1 border-b-2 border-transparent hover:border-purple-400";

  const AuthButtons = () => (
    <>
      {isAuthenticated && (
        <div className="flex items-center gap-4">
          <Link to="/profile" title="Profile">
            <Avatar>
              <AvatarImage src={`https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?principal=${principal}`} alt="User Avatar" />
              <AvatarFallback>{principal ? principal.toText().substring(0, 2).toUpperCase() : '...'}</AvatarFallback>
            </Avatar>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleLogout} style={{ fontFamily: 'AeonikLight, sans-serif' }}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      <header
        // --- MODIFIED: Classes now match MainHeader for consistent styling and behavior ---
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
          ${headerVisible ? 'translate-y-0' : '-translate-y-full'}
          ${scrolled ? 'border-b border-white/10 bg-black/20 backdrop-blur-lg' : 'bg-transparent'}
        `}
      >
        {/* --- MODIFIED: Nav layout now matches MainHeader --- */}
        <nav className="container mx-auto flex items-center justify-between p-4 text-white relative">
          {/* Left Side: Logo */}
          <Link to="/home" className="flex items-center space-x-3 group">
            <img src={logo} alt="DigiPurse Logo" className="h-10 w-10 md:h-12 md:w-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
            <span
              // --- MODIFIED: Brand name consistent with MainHeader ---
              className="text-2xl md:text-3xl font-bold tracking-tight group-hover:text-purple-300 transition-colors duration-300"
              style={{ fontFamily: 'AeonikBold, sans-serif' }}
            >
              DigiPurse
            </span>
          </Link>

          {/* Center: Main Navigation */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <ul className="flex items-center space-x-6">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={navLinkClasses}
                    style={{ fontFamily: 'AeonikLight, sans-serif' }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side: Auth and Mobile Menu */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <AuthButtons />
            </div>
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" className="text-white hover:bg-purple-800/50 hover:text-white">
                <Menu className="h-7 w-7" />
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* MOBILE MENU (No structural change needed) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-xs bg-[#1E0A2E] p-6 text-white shadow-2xl border-l border-purple-400/20">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold" style={{ fontFamily: 'AeonikLight, sans-serif' }}>
                Menu
              </span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="text-white hover:bg-purple-800/50 hover:text-white">
                <X className="h-7 w-7" />
              </Button>
            </div>
            <Separator className="my-4 bg-purple-200/20" />
            <ul className="mt-4 space-y-2">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="block text-lg font-medium text-purple-200 hover:text-white p-3 rounded-md hover:bg-white/5"
                    style={{ fontFamily: 'AeonikLight, sans-serif' }}
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
      
      {/* --- MODIFIED: Removed the spacer div --- */}
    </>
  );
}