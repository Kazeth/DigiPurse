import '../index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/LandingPage';

// User Pages
import HomePage from './pages/HomePage';
import DigiDocumentPage from './pages/DigiDocumentPage';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/">
          <Route index element={LandingPage}/>
        </Route>

        {/* User routes */}
        <Route element="">

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
