import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setLoading(true);
        
        // Try to fetch habits
        const response = await fetch('/api/habits');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch habits: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setHabits(data);
        } else {
          console.warn('Unexpected habits data format:', data);
          setHabits([]);
        }
      } catch (err) {
        console.error('Error fetching habits:', err);
        setError(err.message || 'Failed to load habits');
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Habits | MeshOS</title>
      </Head>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habits Tracker</h1>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Habit
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
            <span className="ml-3 text-gray-700 dark:text-gray-300">Loading habits...</span>
          </div>
        ) : habits.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {habits.map((habit) => (
                <li key={habit._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{habit.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{habit.category} · {habit.type}</p>
                    </div>
                    <div className="flex">
                      <button className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No habits found. Start by adding one!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
