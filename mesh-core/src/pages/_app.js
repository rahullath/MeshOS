import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import '../styles/globals.css';
import DebugPanel from '../components/Debug';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/login');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setIsAuthenticated(true);
        } else {
          // If not authenticated and not on login page, redirect to login
          if (router.pathname !== '/login') {
            router.push('/login');
          }
        }
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

    // Skip auth check on login page
    if (router.pathname === '/login') {
      setLoading(false);
      return;
    }
    
    checkAuth();
  }, [router.pathname]);

  // Enable debug panel with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        {/* Fix for white text on white background */}
        <style jsx global>{`
          .dropdown-select {
            color: var(--input-text) !important;
            background-color: var(--input-bg) !important;
          }
          
          .heading-text {
            color: var(--text-primary) !important;
            font-weight: 600;
          }
          
          /* Fix contrast issues */
          h1, h2, h3, h4, h5, h6 {
            color: var(--text-primary) !important;
          }
        `}</style>
      </Head>

      <Component {...pageProps} key={router.pathname} />
      
      {/* Debug panel (toggle with Ctrl+Shift+D) */}
      {showDebug && <DebugPanel />}
    </ThemeProvider>
  );
}

export default MyApp;
