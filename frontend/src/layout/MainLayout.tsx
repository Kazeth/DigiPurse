import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// Import both header components
import MainHeader from '@/components/MainHeader';
import TicketAppHeader from '@/components/TicketHeader'; 
import SupportCTA from '@/components/SupportCTA';
import MainFooter from '@/components/MainFooter';
import TransferProgress from '@/components/TransferProgress';

export default function MainLayout() {
  const location = useLocation();

  // Define the paths that should use the special Ticket App Header
  const ticketAppPaths = [
    '/digiticket',
    '/marketplace',
    '/events'
    // Add any other ticket-related paths here
  ];

  // Check if the current path is one of the ticket app pages
  const isTicketAppPage = ticketAppPaths.some(path => location.pathname.startsWith(path));
  
  // Check if the current path is the support page to hide the CTA
  const isSupportPage = location.pathname === '/support';

  return (
    <div className="flex min-h-screen flex-col bg-[#11071F] text-white">
      {/* Conditionally render the correct header */}
      {isTicketAppPage ? <TicketAppHeader /> : <MainHeader />}

      {/* The <Outlet> component renders the matched child route's element */}
      <main className="flex-grow">
        <Outlet />
        <TransferProgress />
      </main>

      {/* The support call-to-action section is hidden on the support page */}
      {!isSupportPage && <SupportCTA />}

      {/* The main footer at the bottom */}
      <MainFooter />
    </div>
  );
}
