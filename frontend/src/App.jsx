import '../index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/LandingPage';

// User Pages
import HomePage from './pages/HomePage';
import DigiDocumentPage from './pages/DigiDocumentPage';
import { UserRoute } from './routes/UserRoute';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path='/'>
          <Route index element={LandingPage}/>
        </Route>

        {/* User routes */}
        <Route element={<UserRoute/>}>
          <Route path='home'element={HomePage}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
