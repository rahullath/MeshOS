import { useState, useEffect } from 'react';
import { runApiDiagnostics } from '../utils/apiDebug';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [environment, setEnvironment] = useState({});

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const results = await runApiDiagnostics();
      setDiagnostics(results);
    } catch (error) {
      console.error('Diagnostics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEnvironmentInfo = () => {
    setEnvironment({
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      timestamp: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (isOpen) {
      getEnvironmentInfo();
      runDiagnostics();
    }
  }, [isOpen]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const refreshDiagnostics = () => {
    getEnvironmentInfo();
    runDiagnostics();
  };

  return (
    <div className="fixed bottom-0 right-0 z-50">
      {/* Debug Button */}
      <button
        onClick={togglePanel}
        className="bg-gray-800 text-white p-2 m-4 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none"
        title="Debug Panel"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-11/12 max-w-4xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">MeshOS Debug Panel</h3>
              <div className="flex space-x-2">
                <button
                  onClick={refreshDiagnostics}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  title="Refresh"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path>
                  </svg>
                </button>
                <button
                  onClick={togglePanel}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  title="Close"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {/* Environment Info */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Environment</h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 text-sm font-mono overflow-x-auto">
                  <pre className="text-gray-800 dark:text-gray-200">
                    {JSON.stringify(environment, null, 2)}
                  </pre>
                </div>
              </div>
              
              {/* API Diagnostics */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">API Diagnostics</h4>
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Running diagnostics...</span>
                  </div>
                ) : diagnostics ? (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 text-sm overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Endpoint</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Response</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.entries(diagnostics).map(([endpoint, info]) => (
                          <tr key={endpoint}>
                            <td className="px-4 py-2 text-sm font-mono text-gray-800 dark:text-gray-200">{endpoint}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  info.ok
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}
                              >
                                {info.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm font-mono text-gray-800 dark:text-gray-200">
                              {info.error ? (
                                <span className="text-red-600 dark:text-red-400">{info.error}</span>
                              ) : (
                                info.data || 'No data'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 text-center text-gray-500 dark:text-gray-400">
                    No diagnostics data available
                  </div>
                )}
              </div>
              
              {/* Debug Instructions */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
                <h4 className="text-md font-medium text-blue-800 dark:text-blue-200 mb-2">Troubleshooting Steps</h4>
                <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>Check if API endpoints are responding with 200 status codes</li>
                  <li>Verify that MongoDB connection is working properly</li>
                  <li>Make sure authentication is properly configured</li>
                  <li>Check browser console for JavaScript errors</li>
                  <li>Verify that environment variables are set correctly</li>
                </ol>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">MeshOS v0.1.0</span>
                <button
                  onClick={togglePanel}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}