"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/seperator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// import { AuthClient } from '@dfinity/auth-client';
import { useAuth } from '@/lib/AuthContext';
import { createActor, canisterId } from '@/declarations/Registry_backend';
// import { useUser } from '@/lib/UserContext';

export default function MainHeader() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Authentication State
  const { isAuthenticated, authClient, principal, login, logout } = useAuth();

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => {
    if (!authClient) return;
    const status = await login();
    if (status) {
      console.log("User is authenticated and available");
      const identity = authClient.getIdentity();
      const actor = await createActor(canisterId, { agentOptions: { identity } });
      const exist = await actor.checkUserExist(identity.getPrincipal());
      if (exist) {
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/home' },
    { name: 'About Us', path: '/about' },
    { name: 'Support', path: '/support' },
  ];

  const navLinkClasses = "font-medium text-purple-200 hover:text-white transition-colors duration-300 pb-1 border-b-2 border-transparent hover:border-purple-400";

  const AuthButtons = () => (
    <>
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <Link to="/profile">
            <Avatar>
              <AvatarImage src={`https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?principal=${principal}`} alt="User Avatar" />
              <AvatarFallback>{principal?.toText().substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      ) : (
        <Button onClick={handleLogin} aria-label="Start Now with DigiPurse">
          Start Now
        </Button>
      )}
    </>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${scrolled
          ? 'bg-[#2B0B3F]/95 backdrop-blur-lg shadow-purple-900/20 shadow-lg'
          : 'bg-[#2B0B3F]/80 backdrop-blur-sm'
          }`}
      >
        <nav className="container mx-auto flex items-center justify-between p-4 text-white">
          <Link to="/home" className="flex items-center space-x-3 group">
            <img src={logo} alt="DigiPurse Logo" className="h-10 w-10 md:h-12 md:w-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
            <span className="text-2xl md:text-3xl font-bold tracking-tight group-hover:text-purple-300 transition-colors duration-300">
              DigiPurse
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            <ul className="flex items-center space-x-6">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={navLinkClasses}
                    onClick={(e) => {
                      if (item.name === 'Dashboard' && !isAuthenticated) {
                        e.preventDefault();
                        handleLogin();
                      }
                    }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <AuthButtons />
          </div>

          <div className="lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" className="text-white hover:bg-purple-800/50 hover:text-white">
              <Menu className="h-7 w-7" />
            </Button>
          </div>
        </nav>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-xs bg-[#2B0B3F] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">DigiPurse</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="text-white hover:bg-purple-800/50 hover:text-white">
                <X className="h-7 w-7" />
              </Button>
            </div>
            <ul className="mt-8 space-y-4">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="block text-lg font-medium text-purple-200 hover:text-white p-2 rounded-md"
                    onClick={(e) => {
                      if (item.name === 'Dashboard' && !isAuthenticated) {
                        e.preventDefault();
                        handleLogin();
                      }
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Separator className="my-6 bg-purple-200/20" />
            <div className="w-full">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}

      <div className="h-20" />
    </>
  );
}
