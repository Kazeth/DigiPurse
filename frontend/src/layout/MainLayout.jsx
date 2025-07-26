import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// Import both header components
import MainHeader from '@/components/MainHeader.jsx';
import TicketAppHeader from '@/components/TicketHeader.jsx'; 
import SupportCTA from '@/components/SupportCTA.jsx';
import MainFooter from '@/components/MainFooter';
import TransferProgress from '@/components/TransferProgress';

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
  
  const isSupportPage = location.pathname === '/support';

  return (
    <div className="flex min-h-screen flex-col bg-[#11071F] text-white">
      {isTicketAppPage ? <TicketAppHeader /> : <MainHeader />}

      <main className="flex-grow">
        <Outlet />
        <TransferProgress />
      </main>

      {!isSupportPage && <SupportCTA />}

      <MainFooter />
    </div>
  );
}
