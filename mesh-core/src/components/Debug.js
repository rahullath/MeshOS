import { useState, useEffect } from 'react';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [projectInfo, setProjectInfo] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      collectDebugInfo();
    }
  }, [isOpen]);

  const collectDebugInfo = () => {
    setLoading(true);
    
    try {
      // Collect environment info
      const envInfo = {
        nodeEnv: process.env.NODE_ENV,
        nextVersion: require('next/package.json').version,
        reactVersion: require('react/package.json').version,
      };

      // Collect runtime info
      const runtimeInfo = {
        url: typeof window !== 'undefined' ? window.location.href : 'SSR Mode',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR Mode',
        screenSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'SSR Mode',
        darkMode: typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : 'SSR Mode',
        timestamp: new Date().toISOString(),
      };

      // Check path resolution
      const pathInfo = {
        paths: {
          '@': 'src',
          'middleware': 'src/middleware',
          'lib': 'src/lib',
          'models': 'src/models',
        }
      };

      setProjectInfo({
        envInfo,
        runtimeInfo,
        pathInfo,
      });
    } catch (error) {
      console.error('Error collecting debug info:', error);
      setProjectInfo({
        error: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-0 right-0 z-50">
      {/* Debug Button */}
      <button
        onClick={togglePanel}
        className="bg-blue-600 text-white p-2 m-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none"
        title="Debug Panel"
      >
        <svg 
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
              <button
                onClick={togglePanel}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                title="Close"
              >
                <svg 
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
            
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading debug info...</span>
                </div>
              ) : (
                <>
                  {/* Environment Info */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Environment</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 text-sm font-mono overflow-x-auto">
                      <pre className="text-gray-800 dark:text-gray-200">
                        {JSON.stringify(projectInfo.envInfo, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Runtime Info */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Runtime</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 text-sm font-mono overflow-x-auto">
                      <pre className="text-gray-800 dark:text-gray-200">
                        {JSON.stringify(projectInfo.runtimeInfo, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Path Resolution */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Path Resolution</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 text-sm font-mono overflow-x-auto">
                      <pre className="text-gray-800 dark:text-gray-200">
                        {JSON.stringify(projectInfo.pathInfo, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Debug Instructions */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
                    <h4 className="text-md font-medium text-blue-800 dark:text-blue-200 mb-2">Troubleshooting Recommendations</h4>
                    <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>Check jsconfig.json path aliases match your import statements</li>
                      <li>Ensure all import paths begin with @ for absolute imports</li>
                      <li>Verify MongoDB connection string is properly set in environment variables</li>
                      <li>Check that required middleware files exist and are correctly imported</li>
                      <li>Verify that environment variables are set correctly</li>
                    </ol>
                  </div>
                </>
              )}
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