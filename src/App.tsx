/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import AdminDashboard from './pages/AdminDashboard';
import Breathe from './pages/Breathe';
import Nutrition from './pages/Nutrition';

// Hash listener to cleanly support direct /#/admin URLs
function HashRouteHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#/admin' || hash === '#admin') {
        navigate('/admin');
      } else if (hash.startsWith('#/')) {
        const route = hash.replace('#', '');
        if (route && route !== location.pathname) {
          navigate(route);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [navigate, location.pathname]);

  return null;
}

export default function App() {
  return (
    <Router>
      <HashRouteHandler />
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/breathe" element={<Breathe />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
