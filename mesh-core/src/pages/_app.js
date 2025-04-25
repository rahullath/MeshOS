import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import Layout from '../components/layout/Layout'; // Fixed import path

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Define public routes that do not require authentication
  // Added '/' as a public route based on project structure
  const publicRoutes = ['/login', '/'];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  useEffect(() => {
    const checkAuth = async () => {
      // If navigating to a public route, skip auth check and set loading to false
      if (isPublicRoute) {
        setLoading(false);
        // Optionally set isAuthenticated based on existing token/cookie if needed, but not critical for public routes
        // For now, let's assume if it's a public route, the user doesn't need to be authenticated to view it.
        return;
      }

      // For protected routes, perform authentication check
      try {
        console.log("Checking authentication for:", router.pathname);
        const response = await fetch('/api/auth/me', {
          credentials: "include", // Include cookies with the request
        });

        if (response.ok) {
          console.log("Authentication successful");
          setIsAuthenticated(true);
        } else {
          console.log("Authentication failed");
          setIsAuthenticated(false);
          // If authentication fails and the current page is NOT login, redirect to login
          if (router.pathname !== '/login') {
            console.log("Redirecting to /login");
            router.push('/login');
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsAuthenticated(false);
         // If an error occurs and the current page is NOT login, redirect to login
        if (router.pathname !== '/login') {
           console.log("Redirecting to /login due to error");
           router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    // Run the auth check when the route path changes or on initial mount
    checkAuth();

  }, [router.pathname]); // Dependency array ensures effect runs on route changes

  // Show a loading spinner while the auth check is in progress.
  // Also show loading if not authenticated and on a protected route, waiting for redirect.
  if (loading || (!isAuthenticated && !isPublicRoute)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Loading MeshOS...</p>
          </div>
        </div>
      );
  }

  // If authenticated or on a public route and not loading, render the page content.
  // The Layout component is wrapped around the Component.
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

      {/* Render the layout and the current page component */}      
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}

export default MyApp;
