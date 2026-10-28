import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2, ServerCrash, WifiOff } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useEffect, useState } from 'react';
import { axiosInstance } from './lib/axios';

import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Room from './pages/Room';
import JoinRoom from './pages/JoinRoom';
import Admin from './pages/Admin';
import Landing from './pages/Landing';
import { GlobalNotification } from './components/layout/GlobalNotification';
import { Button } from './components/ui/Button';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuth();
  const location = useLocation();

  if (!authUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default function App() {
  const { authUser, isCheckingAuth } = useAuth();
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isCheckingServer, setIsCheckingServer] = useState(true);

  // Initial Server Health Check
  useEffect(() => {
    const checkServer = async () => {
      try {
        await axiosInstance.get('/health', { timeout: 5000 }); // 5 second timeout
        setIsServerOffline(false);
      } catch (error) {
        setIsServerOffline(true);
      } finally {
        setIsCheckingServer(false);
      }
    };
    checkServer();

    // Optional: Keep checking every 30 seconds if offline
    const interval = setInterval(() => {
      if (isServerOffline) checkServer();
    }, 30000);

    return () => clearInterval(interval);
  }, [isServerOffline]);

  // Loading State
  if (isCheckingServer || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cinematic">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // Server Offline Screen
  if (isServerOffline) {
    return (
      <div className="min-h-screen bg-cinematic flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient red glow for offline state */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="backdrop-blur-xl bg-black/40 border border-red-500/20 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center z-10">
          <div className="flex justify-center mb-6 relative">
            <ServerCrash className="w-20 h-20 text-red-500/80" />
            <div className="absolute -bottom-2 -right-2 bg-red-600 rounded-full p-1.5 border-4 border-[#050314]">
              <WifiOff className="w-5 h-5 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Server Offline</h1>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            The main computer hosting the movies and database is currently turned off or disconnected from the network. Please wait for the host to bring the system online.
          </p>

          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30"
          >
            Try Reconnecting
          </Button>
        </div>
      </div>
    );
  }

  // Normal App Render
  return (
    <BrowserRouter>
      <Navbar />
      <GlobalNotification />
      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Landing />} />
        <Route path="/room/:id" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/join/:id/:token" element={<ProtectedRoute><JoinRoom /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!authUser ? <Register /> : <Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}