import React from "react";
import portrait from './images/portrait.jpg';
import landscape from './images/landscape.jpg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home'; // Import your page components
import Contact from './pages/Contact';
import Map from './pages/Map';
import Review from './pages/Review';
import Auth from './pages/Auth';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';

function HifazatHeader({ currentPath }) {
  return (
    <header className="hifazat-header notch-header">
      <div className="notch-left app-name">Hifazat</div>
      <nav className="notch-center">
        <ul>
          <li><Link to="/" className={currentPath === "/" ? "active" : ""}>HOME</Link></li>
          <li><Link to="/map" className={currentPath === "/map" ? "active" : ""}>MAPS</Link></li>
          <li><Link to="/review" className={currentPath === "/review" ? "active" : ""}>REVIEWS</Link></li>
          <li><Link to="/contact" className={currentPath === "/contact" ? "active" : ""}>CONTACT</Link></li>
        </ul>
      </nav>
      <div className="notch-right">
        <Link to="/login"><button className="notch-login-btn">LOGIN</button></Link>
      </div>
    </header>
  );
}

function CenterCircularButton() {
  const navigate = useNavigate();
  return (
    <div className="center-circular-btn">
      <div className="circular-btn">
        <svg viewBox="0 0 180 180" className="circular-btn-svg">
          <defs>
            <path id="circlePath" d="M90,90 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
          </defs>
          <text fill="#111" fontSize="15" fontWeight="600" letterSpacing="2">
            <textPath xlinkHref="#circlePath" startOffset="0">
              Search• Search• Search• Search• Search• Search • Search •
            </textPath>
          </text>
        </svg>
        <button className="circular-btn-main" onClick={() => navigate('/map')}>MAPS</button>
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <main className="main-content-custom">
      <div className="top-row">
        <div className="top-left bold-title">
          <h1>Your First Thought<br />  Save Time and  <br /> Peace</h1>
        </div>
        <div className="top-right portrait-image">
          <img src={portrait} alt="Portrait - Girl with yellow bow in field" />
        </div>
      </div>
      <div className="bottom-row">
        <div className="bottom-left landscape-image">
          <img src={landscape} alt="Landscape - Girl in hat in field with mountains" />
        </div>
        <div className="bottom-right download-card">
          <div className="download-title">Write Your Reviews First</div>
          <div className="download-desc">
          Share your review to help everyone make safer choices.
          </div>
          <button className="download-btn">
            <i>   Write Your First Reviews</i> <span className="download-icon">↓</span>
        </button>
      </div>
    </div>
    </main>
  );
}

function AppContent() {
  const location = useLocation();
  return (
    <AuthProvider>
      <div className="main-bg">
        <div className="app-container">
          <HifazatHeader currentPath={location.pathname} />
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
            <Route path="/review" element={<ProtectedRoute><Review /></ProtectedRoute>} />
          </Routes>
          {location.pathname === '/' && <CenterCircularButton />}
        </div>
      </div>
    </AuthProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
