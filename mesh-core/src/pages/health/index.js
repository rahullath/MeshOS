import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';

export default function HealthPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Placeholder data
        setHealthData({
          // Empty data for now
        });
      } catch (err) {
        console.error('Error fetching health data:', err);
        setError('Failed to load health data.');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Health | MeshOS</title>
      </Head>
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Health Overview</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Loading health data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Sleep Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Sleep Tracker</h2>
              <p className="text-gray-500 dark:text-gray-400">Track your sleep patterns and quality.</p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Log Sleep</button>
              </div>
            </div>
            
            {/* Heart Rate Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Heart Rate</h2>
              <p className="text-gray-500 dark:text-gray-400">Track your heart rate over time.</p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Log Heart Rate</button>
              </div>
            </div>
            
            {/* Medication Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Medication Tracker</h2>
              <p className="text-gray-500 dark:text-gray-400">Track your medication schedule and adherence.</p>
              <div className="mt-4">
                <div className="mb-4">
                  <div className="flex items-center">
                    <input type="checkbox" id="med1" className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="med1" className="ml-2 text-gray-700 dark:text-gray-300">Bupropion XL 150 - Morning</label>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <input type="checkbox" id="med2" className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="med2" className="ml-2 text-gray-700 dark:text-gray-300">Bupropion XL 150 - Afternoon</label>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <input type="checkbox" id="med3" className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="med3" className="ml-2 text-gray-700 dark:text-gray-300">Melatonin - Evening</label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Import Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Import Health Data</h2>
              <p className="text-gray-500 dark:text-gray-400">Import data from external health tracking devices.</p>
              <div className="mt-4">
                <a href="/import/health" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block">
                  Import Data
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
