import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// Import the layout components we've created
import MainHeader from '@/components/MainHeader';
import SupportCTA from '@/components/SupportCTA';
import MainFooter from '@/components/MainFooter';

// This component no longer needs to accept 'children' as a prop.
// React Router's <Outlet> component will handle rendering the active child route.
export default function MainLayout() {
  const location = useLocation();
  const isSupportPage = location.pathname === '/support';

  return (
    <div className="flex min-h-screen flex-col bg-[#11071F] text-white">
      {/* The header will be fixed at the top */}
      <MainHeader />

      {/* The <Outlet> component renders the matched child route's element */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* The support call-to-action section is now hidden on the support page */}
      {!isSupportPage && <SupportCTA />}

      {/* The main footer at the bottom */}
      <MainFooter />
    </div>
  );
}
