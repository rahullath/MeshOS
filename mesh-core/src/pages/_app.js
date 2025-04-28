// mesh-core/src/pages/_app.js
import '../styles/globals.css';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import Layout from '../components/layout/Layout'; // Assuming Layout component exists
import Modal from '../components/Modal'; // Import the Modal component
import ModalContentPage from './modal/[[...modalRoute]]'; // Import the dynamic modal content page


function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backgroundRoute, setBackgroundRoute] = useState(null);
  const [modalPageProps, setModalPageProps] = useState({}); // To hold props for modal content


  // Define public routes that do not require authentication
  const publicRoutes = ['/login', '/']; // Add other public routes here

  // Function to check if a route is a modal route
  const isModalPath = (path) => path.startsWith('/modal/');

  // --- Authentication Logic (Keep existing) ---
  useEffect(() => {
    const checkAuth = async () => {
      const currentPathIsPublic = publicRoutes.includes(router.pathname);
      const currentPathIsModal = isModalPath(router.asPath);

      // If navigating to a public route or a modal route (which overlays a background page), skip initial blocking auth check
      // We rely on withAuth middleware to protect API routes and individual page components
      if (currentPathIsPublic || currentPathIsModal) {
        setLoading(false);
        // We might still want to check auth status in background for public/modal routes
        // but we won't block the render based on it immediately.
         fetch('/api/auth/me', { credentials: "include" })
            .then(res => res.ok ? setIsAuthenticated(true) : setIsAuthenticated(false))
            .catch(() => setIsAuthenticated(false));
        return;
      }

      // For protected routes, perform authentication check
      try {
        console.log("Checking authentication for protected route:", router.pathname);
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

  }, [router.pathname, router.asPath]); // Dependency array ensures effect runs on route changes

  // --- Modal Logic ---
  useEffect(() => {
    const handleRouteChange = (url, { shallow }) => {
      console.log('Route changing to:', url, 'Shallow:', shallow);
      if (isModalPath(url)) {
        // If the next route is a modal path
        if (!isModalPath(router.asPath)) {
             // If the current route is NOT a modal path, save it as background
            console.log('Transitioning to modal from:', router.asPath);
            setBackgroundRoute(router.asPath);
        }
        setIsModalOpen(true);
         // When navigating to a modal path, the 'Component' provided by Next.js
        // will be the ModalContentPage, and pageProps will be for that page.
        // We capture these props here.
        setModalPageProps(pageProps); // Capture props specifically for the modal page
        console.log('Modal opened for:', url);

      } else if (isModalPath(router.asPath) && !isModalPath(url)) {
        // If the current route IS a modal path, but the next route is NOT
        console.log('Transitioning away from modal to:', url);
        setIsModalOpen(false);
        setBackgroundRoute(null); // Clear background route
        setModalPageProps({}); // Clear modal props
         console.log('Modal closed');
      }
       // If navigating between non-modal routes, or between modal routes,
       // the state should manage itself or is handled by the initial render check.
    };

    // Listen to route change complete, not start, to ensure pageProps are available
    router.events.on('routeChangeComplete', handleRouteChange);

    // Clean up event listener on component unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
     // Add router.asPath and pageProps as dependencies because handleRouteChange uses them
  }, [router.events, router.asPath, pageProps]); // Added pageProps as dependency

    // Function to close the modal
    const closeModal = useCallback(() => {
        if (backgroundRoute) {
            router.push(backgroundRoute, undefined, { shallow: true }); // Navigate back preserving shallow history
        } else {
             // Fallback if no background route is saved (e.g., direct modal access)
             // You might want to navigate to a default page like '/'
             router.push('/', undefined, { shallow: true });
        }
    }, [router, backgroundRoute]); // closeModal depends on router and backgroundRoute


  // Show loading spinner while the auth check is in progress,
  // but only if we are on a route that requires authentication and is not a modal path.
  // Modal paths will render the background page first, then the modal.
   const requiresAuthAndNotModal = !publicRoutes.includes(router.pathname) && !isModalPath(router.asPath);


  if (loading && requiresAuthAndNotModal) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Loading MeshOS...</p>
          </div>
        </div>
      );
  }

   // If not authenticated and on a protected route (that isn't a modal overlay),
   // we are waiting for the redirect from the useEffect. Don't render content yet.
  if (!isAuthenticated && requiresAuthAndNotModal) {
      return null; // Or a minimal loading/redirect message
  }


  // Determine which Component to render as the background
  // When a modal is open, Next.js's `Component` is the modal content page.
  // We want to render the page *behind* the modal.
  // A simple way is to let Next.js handle rendering based on the URL.
  // If isModalOpen is true, the current URL is the modal URL, and Component is ModalContentPage.
  // We will render the page that corresponds to the backgroundRoute URL instead.
  // However, obtaining the Component and pageProps for backgroundRoute here is tricky.

  // A simpler approach: Always render the Component provided by Next.js based on the current URL.
  // If the URL is a modal URL, Next.js renders ModalContentPage.
  // We then *overlay* the Modal component.
  // The "background dynamic" effect comes from the browser *not* doing a full page navigation,
  // and the Modal component being fixed/absolute position on top of the existing DOM.

  const currentPageIsModalContent = isModalPath(router.asPath);

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Head>
        <title>MeshOS - Your Life Management System</title>
        <meta name="description" content="A comprehensive personal dashboard for organizing your life" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Critical CSS fixes for text visibility - Keep existing */}
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

      {/* Render the base page content */}
       {/* If a modal is open, the Component provided by Next.js is the ModalContentPage.
           We need to render the Component for the background route instead.
           This requires fetching the background page Component and props, which is complex in _app.js.

           Simplified approach: Let Next.js render the page based on the current URL.
           If the URL is `/modal/...`, Component is ModalContentPage.
           If isModalOpen is true, we are on a modal route. We render the Layout and whatever Component Next.js gives us
           for the current URL (which will be the ModalContentPage component).
           Then, we overlay the Modal component containing that ModalContentPage.
           This works because the *previous* page's DOM is still technically rendered by the browser
           and the Modal is layered on top.
       */}
       {/* Render the standard layout and page component based on the current URL */}
       {/* If on a modal route, Component will be ModalContentPage */}
      <Layout>
         {/* Render the current Component provided by Next.js */}
        <Component {...pageProps} />
      </Layout>


      {/* Conditionally render the Modal overlay */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          {/* Render the ModalContentPage inside the modal */}
          {/* We pass the Component (which is ModalContentPage when isModalOpen is true)
              and its pageProps to be rendered inside the Modal */}
           <ModalContentPage {...modalPageProps} />
        </Modal>
      )}
    </ThemeProvider>
  );
}

export default MyApp;
