import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import Layout from '../components/layout/Layout'; // Fixed import path

// Simplified version without Debug component dependency
function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Allow login routes without authentication
  const publicRoutes = ['/login',"/"];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  // Simple auth check on initial load
  useEffect(() => {
    // For public routes, don't check auth
    if (isPublicRoute) {
      setLoading(false);
      return;
    };
    console.log("Executing checkAuth")
    
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me',{
          credentials: "omit",
        });

        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/login');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsAuthenticated(false);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    
  }, [router.pathname]);


  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading MeshOS...</p>
        </div>
      </div>
    );
  }
  if(!loading && !isAuthenticated){
    router.push("/login");
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Head>
        <title>MeshOS - Your Life Management System</title>
        <meta name="description" content="A comprehensive personal dashboard for organizing your life" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Critical CSS fixes for text visibility */}
        <style jsx global>{`
          h1, h2, h3, h4, h5, h6 {
            color: var(--text-primary, #1E293B) !important;
          }
          .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
            color: #F8FAFC !important;
          }
          select, input, textarea {
            color: #1E293B !important;
            background-color: #FFFFFF !important;
          }
          .dark select, .dark input, .dark textarea {
            color: #F8FAFC !important;
            background-color: #1E293B !important;
          }
        `}</style>
      </Head>

      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
