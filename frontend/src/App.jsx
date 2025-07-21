import '../index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Hooks
import ScrollToTop from './components/hooks/UseScrollToTop';
// Public Pages
import LandingPage from './pages/LandingPage';
import AboutUsPage from './pages/AboutUsPage';
import SupportPage from './pages/SupportPage';

// Layouts
import Layout from './layout/MainLayout';

// User Pages
import HomePage from './pages/HomePage';
import PostLoginPage from './pages/PostLoginPage'
import DigiDocumentPage from './pages/DigiDocumentPage';
import DigiPaymentPage from './pages/DigiPaymentPage';
import DigiTicketPage from './pages/TicketDashboard';
import TicketMarketplace from './pages/TicketMarketplace'
import TicketEventsPage from './pages/TicketEventsPage'
import TicketEventDetailsPage from './pages/TicketEventDetailsPage'
import { UserRoute } from './routes/UserRoute';

import { AuthProvider } from './AuthContext';

// Document Upload/Download Progress
import TransferProgress from './components/TransferProgress';
import { TransferProvider } from './lib/TransferProgressContext';


function App() {
  return (
    <AuthProvider>
      <TransferProvider>
        <Router>
          <ScrollToTop />
          <Routes>

            <Route path='/' element={<Layout />}>
              {/* --- Public Routes --- */}
              <Route index element={<LandingPage />} />
              <Route path='about' element={<AboutUsPage />} />
              <Route path='support' element={<SupportPage />} />

              {/* --- Protected User Routes --- */}
              <Route element={<UserRoute />}>
                <Route path='postlogin' element={<PostLoginPage />} />
                <Route path='home' element={<HomePage />} />
                <Route path='digidocument' element={<DigiDocumentPage />} />
                <Route path='digipayment' element={<DigiPaymentPage />} />
                <Route path='digiticket' element={<DigiTicketPage />} />
                <Route path='marketplace' element={<TicketMarketplace />} />
                <Route path='events' element={<TicketEventsPage />} />
                <Route path='events/:eventID' element={<TicketEventDetailsPage />} />
              </Route>

            </Route>
          </Routes>
          <TransferProgress />
        </Router>
      </TransferProvider>
    </AuthProvider>
  );
}

export default App;