import '../index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
import DigiTicketPage from './pages/DigiTicketPage';
import { UserRoute } from './routes/UserRoute';

function App() {
  return (
    <Router>
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
          </Route>

        </Route>
      </Routes>
    </Router>
  );
}

export default App;