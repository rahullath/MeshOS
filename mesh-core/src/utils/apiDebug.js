/**
 * Utility to help debug API calls in MeshOS
 */

// Enhanced fetch wrapper for debugging
export const debugFetch = async (url, options = {}) => {
  console.log(`🔍 API Request: ${url}`, options);
  
  try {
    const response = await fetch(url, options);
    
    // Clone the response so we can log it and still return it
    const clonedResponse = response.clone();
    
    try {
      const data = await clonedResponse.json();
      console.log(`✅ API Response (${response.status}): ${url}`, data);
      
      if (!response.ok) {
        console.error(`❌ API Error (${response.status}): ${url}`, data);
      }
      
      return response;
    } catch (jsonError) {
      console.error(`❌ JSON Parse Error: ${url}`, jsonError);
      return response;
    }
  } catch (fetchError) {
    console.error(`❌ Fetch Error: ${url}`, fetchError);
    throw fetchError;
  }
};

// Test essential API endpoints and report status
export const runApiDiagnostics = async () => {
  console.log('🧪 Running API diagnostics...');
  const endpoints = [
    '/api/auth/me',
    '/api/tasks',
    '/api/habits',
    '/api/health/summary',
    '/api/finance/transactions',
    '/api/content/watched'
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      const status = response.status;
      let data = null;
      
      try {
        data = await response.json();
      } catch (e) {
        // JSON parse error - leave data as null
      }
      
      results[endpoint] = {
        status,
        ok: response.ok,
        data: data ? (data.message || 'Data received') : null,
        error: !response.ok
      };
      
    } catch (error) {
      results[endpoint] = {
        status: 'Network Error',
        ok: false,
        data: null,
        error: error.message
      };
    }
  }
  
  console.table(results);
  return results;
};

// Add this to any component that's failing to load data
export const ErrorBoundary = ({ children, fallback, onError }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (hasError && onError) {
      onError(error);
    }
  }, [hasError, error, onError]);

  if (hasError) {
    return fallback || (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-medium">Something went wrong</h3>
        <pre className="mt-2 text-sm text-red-700 overflow-auto">
          {error?.message || String(error)}
        </pre>
        <button 
          className="mt-3 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          onClick={() => {
            setHasError(false);
            setError(null);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  try {
    return children;
  } catch (error) {
    setHasError(true);
    setError(error);
    return null;
  }
};
