import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';

export default function ContentPage() {
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // In a production app, you would fetch from your API
        // For now, use a simulated delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // No content yet - empty array
        setWatched([]);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load watched content.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Content | MeshOS</title>
      </Head>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Dashboard</h1>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Content
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Loading content...</span>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Watched Content</h2>
              {watched.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {watched.map((item, index) => (
                    <li key={index} className="py-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-md font-medium">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.type} • {item.watched}</p>
                        </div>
                        <div>
                          {item.rating && <span>Rating: {item.rating}/5</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No watched content found. Add some content to get started!</p>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recommendations</h2>
              <p className="text-gray-500 dark:text-gray-400">Recommendations will appear here once you've logged some watched content.</p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
