import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useChallengeStore } from './store/challengeStore';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';

function App() {
  const { fetchChallenges } = useChallengeStore();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state and fetch challenges when app loads
    initializeAuth();
    fetchChallenges();
  }, [initializeAuth, fetchChallenges]);

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;