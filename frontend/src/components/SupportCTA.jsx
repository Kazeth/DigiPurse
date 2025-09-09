"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LifeBuoy } from 'lucide-react'; // An icon for support

export default function SupportCTA() {
  return (
    <section className="bg-purple-900/20 py-12 sm:py-16">
      <div className="container mx-auto flex flex-col items-center justify-center text-center p-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10 mb-4">
          <LifeBuoy className="h-8 w-8 text-white" />
        </div>
        <h2
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          style={{ fontFamily: 'AeonikBold, sans-serif' }}
        >
          Have Questions?
        </h2>
        <p
          className="mt-4 max-w-2xl text-lg leading-8 text-purple-200/80"
          style={{ fontFamily: 'AeonikLight, sans-serif' }}
        >
          Our support team is here to help. Visit our support page for FAQs, guides, and to get in touch with us directly.
        </p>
        <div className="mt-8">
          <Link to="/support">
            <Button
              size="lg"
              aria-label="Go to Support Page"
              style={{ fontFamily: 'AeonikBold, sans-serif' }}
            >
              Get Support
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}