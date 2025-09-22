import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// Import all layout components
import MainHeader from '@/components/MainHeader.jsx';
import TicketAppHeader from '@/components/TicketHeader.jsx'; 
import SupportCTA from '@/components/SupportCTA.jsx';
import MainFooter from '@/components/MainFooter';
import TransferProgress from '@/components/TransferProgress';
import NewsletterCard from '@/components/Newsletter.jsx';

export default function MainLayout() {
  const location = useLocation();

  const ticketAppPaths = [
    '/digiticket',
    '/marketplace',
    '/events',
    '/create-event',
    '/sell-ticket',
    '/tickets',
  ];

  const isTicketAppPage = ticketAppPaths.some(path => location.pathname.startsWith(path));
  const isNoHeaderPage = location.pathname === '/postlogin';
  const isSupportPage = location.pathname === '/support';
  
  // --- NEW: Define on which pages the newsletter should appear ---
  // This prevents it from showing up on every single page (like the wallet or dashboard).
  const showNewsletterPaths = [
    '/', // Show on the Landing Page
    '/about', // Example: show on an "About Us" page
  ];
  const shouldShowNewsletter = showNewsletterPaths.includes(location.pathname);


  return (
    <div className="flex min-h-screen flex-col bg-[#11071F] text-white">
      {!isNoHeaderPage && (isTicketAppPage ? <TicketAppHeader /> : <MainHeader />)}

      <main className="flex-grow">
        {/* Your comment is good, but the padding should be inside each page component */}
        <div>
          <Outlet />
        </div>
        <TransferProgress />
      </main>

      {/* --- NEW: Conditionally rendered Newsletter section --- */}
      {shouldShowNewsletter && (
        <section className="w-full container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <NewsletterCard />
        </section>
      )}

      {!isSupportPage && <SupportCTA />}

      <MainFooter />
    </div>
  );
}