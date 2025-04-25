import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'; // Add this import
import { ThemeProvider } from 'next-themes';
import DebugPanel from '../components/Debug';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false); // Add state for showDebug

  // Toggle DebugPanel with Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simple auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Skip auth check on login page
        if (router.pathname === '/login') {
          setLoading(false);
          return;
        }

        // For debugging - just load the page without auth check
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        // If we can't check auth, assume not authenticated
        if (router.pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router.pathname]);

  // Show loading screen while checking auth
  if (loading && router.pathname !== '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading MeshOS...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class">
      <Head>
        <title>MeshOS - Your Life Management System</title>
        <meta name="description" content="A comprehensive personal dashboard for organizing your life" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Component {...pageProps} key={router.pathname} />

      {/* Debug panel (toggle with Ctrl+Shift+D) */}
      {showDebug && <DebugPanel />}
    </ThemeProvider>
  );
}

export default MyApp;