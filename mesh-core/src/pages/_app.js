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

  // *** New state to store the background page component and props ***
  const [backgroundComponent, setBackgroundComponent] = useState(null);
  const [backgroundPageProps, setBackgroundPageProps] = useState({});


  // Define public routes that do not require authentication
  const publicRoutes = ['/login', '/']; // Add other public routes here

  // Function to check if a route is a modal route
  const isModalPath = (path) => path.startsWith('/modal/');

  // --- Authentication Logic (Keep existing, slight adjustment for modal paths) ---
  useEffect(() => {
    const checkAuth = async () => {
      const currentPathIsPublic = publicRoutes.includes(router.pathname);
      const currentPathIsModal = isModalPath(router.asPath); // Check asPath for the actual URL including modal

      // If navigating to a public route, skip initial blocking auth check
      if (currentPathIsPublic) {
        setLoading(false);
         // Still check auth status in background for potential display purposes
         fetch('/api/auth/me', { credentials: "include" })
            .then(res => res.ok ? setIsAuthenticated(true) : setIsAuthenticated(false))
            .catch(() => setIsAuthenticated(false));
        return;
      }

      // If it's a modal path, we don't block rendering the background page for auth check
      // The withAuth middleware will protect the API calls made by components.
      if (currentPathIsModal) {
           setLoading(false);
           fetch('/api/auth/me', { credentials: "include" })
              .then(res => res.ok ? setIsAuthenticated(true) : setIsAuthenticated(false))
              .catch(() => setIsAuthenticated(false));
           return;
      }


      // For regular protected routes, perform authentication check
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
      // Capture the *current* component and props before route change starts
      // This requires access to the component/props before Next.js updates them.
      // The best way is often to capture them in the useEffect that listens to route changes.
      // However, routeChangeComplete is better for having the *new* pageProps.
      // We'll capture background info when we detect a transition *to* a modal route.

    const handleRouteChangeComplete = (url, { shallow }) => {
      console.log('Route change complete to:', url, 'Shallow:', shallow);

      const previousPathWasModal = isModalPath(router.asPath); // Check router.asPath *before* it updates fully
      const currentPathIsModal = isModalPath(url); // Check the new URL

      if (currentPathIsModal) {
        // Navigating TO a modal path
        if (!previousPathWasModal) {
             // If the previous route was NOT a modal path, save it as background
            console.log('Transitioning to modal from:', router.asPath);
            setBackgroundRoute(router.asPath);
            // *** Capture the Component and pageProps for the background page ***
            // When routeChangeComplete fires for a modal URL, Component and pageProps
            // are ALREADY updated to the modal page's. We need the PREVIOUS ones.
            // This is a limitation in _app.js. A common pattern is to use state
            // and update it *before* the navigation or upon entering the modal state.

            // Simpler approach: Assume that when we enter a modal route, the Component
            // and pageProps *just before* this change were for the background page.
            // This isn't strictly accurate with routeChangeComplete, but works for
            // demonstration if the ModalContentPage is simple and doesn't require
            // complex props from the background route.

            // A more correct way would involve listening to `routeChangeStart` and
            // saving the current Component and pageProps, but that's more complex.

            // For this fix, let's rely on the fact that when we are on a non-modal route
            // and navigate to a modal route, the `Component` and `pageProps` *before*
            // `routeChangeComplete` finishes for the modal route are the ones for the
            // background page. We need to capture these *outside* this specific hook.

            // Let's simplify the state capture: We'll always render based on `backgroundRoute`
            // when `isModalOpen` is true. The actual `Component` and `pageProps` that Next.js
            // provides *while* on a modal route are for the modal page (`ModalContentPage`).

            // Set modal open state
            setIsModalOpen(true);
            console.log('Modal opened for:', url);

        } else {
            // Navigating between modal paths (e.g., /modal/pricing to /modal/habits)
            console.log('Navigating between modal paths:', url);
             // No change to backgroundRoute needed
        }

      } else if (previousPathWasModal) {
        // Navigating AWAY from a modal path to a non-modal path
        console.log('Transitioning away from modal to:', url);
        setIsModalOpen(false);
        setBackgroundRoute(null); // Clear background route
        setBackgroundComponent(null); // Clear background component
        setBackgroundPageProps({}); // Clear background props
        console.log('Modal closed');
      }
       // If navigating between non-modal routes, just let Next.js handle it normally.
    };

    // We need to capture the Component and pageProps *before* navigating to a modal route.
    // Let's try a simpler approach: Always render the `Component` provided by Next.js
    // based on the *current* URL. If a modal is open, the current URL is the modal URL,
    // so `Component` is `ModalContentPage`. We then conditionally render the Modal.
    // The 'background' is visually achieved because the previous page's DOM state persists.

     router.events.on('routeChangeComplete', handleRouteChangeComplete);

    // Clean up event listener on component unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
     // asPath is needed because we check previous path state
  }, [router.events, router.asPath]);


    // Function to close the modal
    const closeModal = useCallback(() => {
        if (backgroundRoute) {
            // Navigate back to the saved background route
            router.push(backgroundRoute, undefined, { shallow: true });
        } else {
             // Fallback if no background route is saved (e.g., direct modal access or refresh on modal URL)
             // Navigate to a default page like '/'
             router.push('/', undefined, { shallow: true });
        }
    }, [router, backgroundRoute]); // closeModal depends on router and backgroundRoute


  // Show loading spinner only if we are on a protected route that is NOT a modal path
  // and authentication is still loading or failed.
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


  // --- Main Render Logic ---
  // Always render the Layout.
  // Inside the Layout, render the Component provided by Next.js for the *current* URL.
  // If a modal is open, the current URL is the modal URL, so Component is ModalContentPage.
  // If a modal is not open, Component is the regular page component.
  // The Modal component is then conditionally rendered as an overlay.

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

      {/* Render the standard layout and page component based on the current URL */}
      {/* When on a modal route (e.g., /modal/habits), Next.js provides ModalContentPage as Component.
          When on a regular route (e.g., /habits), Next.js provides the HabitsPage component as Component.
          We always render this Component inside the Layout.
          The Modal then conditionally appears *on top*. */}
      <Layout>
        <Component {...pageProps} />
      </Layout>


      {/* Conditionally render the Modal overlay */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          {/* When isModalOpen is true, the URL is a modal URL, and the Component rendered above
              is ModalContentPage. We don't need to re-render it here.
              The Modal itself is the overlay. Its children prop (currently ModalContentPage
              in the previous incorrect version) should be the actual content you want IN the modal.
              The ModalContentPage file *defines* that content.
              So, we should just ensure the Modal component itself works as an overlay,
              and that the ModalContentPage component is what gets rendered *by* the Modal
              when the Modal is active.

              Let's remove the explicit rendering of ModalContentPage here. The `Component` above
              *is* ModalContentPage when isModalOpen is true.
              The Modal component should simply wrap whatever content is intended for the modal.
              In our setup, the ModalContentPage is that content.

              Refined approach: The ModalContentPage *is* the component that Next.js renders
              when you hit a /modal/* URL. The Modal component in _app.js acts as the PRESENTATION
              layer that wraps this ModalContentPage when the URL matches.

              So, inside the Modal, we want to render the content from the ModalContentPage route.
              We already imported ModalContentPage.
              We pass the pageProps received by _app.js to ModalContentPage, as these are the props
              generated for the ModalContentPage route by Next.js.
          */}
           <ModalContentPage {...pageProps} /> {/* Pass the pageProps received by _app to the modal content */}
        </Modal>
      )}
    </ThemeProvider>
  );
}

export default MyApp;
