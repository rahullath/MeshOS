import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setLoading(true);
        
        // Instead of API call, use hardcoded data for now while we debug API connections
        const sampleHabits = [
          {
            _id: '1',
            name: 'Morning Exercise',
            category: 'health',
            type: 'positive',
            streak: 0,
            createdAt: new Date(Date.now() - 86400000 * 30) // 30 days ago
          },
          {
            _id: '2',
            name: 'Meditate',
            category: 'mental',
            type: 'positive',
            streak: 3,
            createdAt: new Date(Date.now() - 86400000 * 20) // 20 days ago
          },
          {
            _id: '3',
            name: 'No Smoking',
            category: 'health',
            type: 'negative',
            streak: 7,
            createdAt: new Date(Date.now() - 86400000 * 10) // 10 days ago
          },
          {
            _id: '4',
            name: 'Code Daily',
            category: 'productivity',
            type: 'positive',
            streak: 5,
            createdAt: new Date(Date.now() - 86400000 * 15) // 15 days ago
          },
          {
            _id: '5',
            name: 'No Energy Drinks',
            category: 'health',
            type: 'negative',
            streak: 2,
            createdAt: new Date(Date.now() - 86400000 * 5) // 5 days ago
          }
        ];
        
        // Filter based on the active tab
        let filteredHabits = [...sampleHabits];
        
        if (activeTab !== 'all') {
          filteredHabits = sampleHabits.filter(habit => habit.type === activeTab);
        }
        
        setHabits(filteredHabits);
      } catch (err) {
        console.error('Error fetching habits:', err);
        setError('Failed to load habits');
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, [activeTab]);

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'health':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'productivity':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'mental':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

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
        
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-4 px-1 ${
                activeTab === 'all'
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              All Habits
            </button>
            <button
              onClick={() => setActiveTab('positive')}
              className={`pb-4 px-1 ${
                activeTab === 'positive'
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Build Habits
            </button>
            <button
              onClick={() => setActiveTab('negative')}
              className={`pb-4 px-1 ${
                activeTab === 'negative'
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Quit Habits
            </button>
          </nav>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {habits.map((habit) => (
              <div key={habit._id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{habit.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(habit.category)}`}>
                          {habit.category}
                        </span>
                        <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {habit.type === 'positive' ? 'Build' : 'Quit'}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{habit.streak}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">day streak</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <div className="flex space-x-2">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            i < habit.streak % 7
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                          }`}
                        >
                          {i < habit.streak % 7 ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span>·</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="ml-auto">
                      <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
