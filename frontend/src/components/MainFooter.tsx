"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin } from 'lucide-react'; // Social media icons
import logo from '../assets/logo.png'; // Assuming you want the logo in the footer as well

export default function MainFooter() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-[#1E0A2E]">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="DigiPurse Logo" className="h-8 w-8" />
            <span
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'AeonikBold, sans-serif' }}
            >
              DigiPurse
            </span>
          </Link>
          <p
            className="max-w-md mx-auto mt-4 text-purple-300/70"
            style={{ fontFamily: 'AeonikLight, sans-serif' }}
          >
            A decentralized Web3 application to streamline your digital life.
          </p>
          <div className="flex justify-center mt-6 space-x-6">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-purple-300/70 hover:text-white transition-colors duration-300"
                aria-label={`Visit our ${social.name} page`}
                style={{ fontFamily: 'AeonikLight, sans-serif' }}
              >
                <social.icon className="h-6 w-6" />
              </a>
            ))}
          </div>
        </div>

        <hr className="my-6 border-purple-200/20" />

        <div className="text-center text-purple-300/70">
          <p style={{ fontFamily: 'AeonikLight, sans-serif' }}>
            &copy; {currentYear} DigiPurse. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}