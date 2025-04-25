import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    habitStreak: 0,
    tasksCompleted: 0,
    tasksRemaining: 0,
    healthMetrics: 0,
    financeTransactions: 0,
    contentItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulated stats since we can't fully parse MongoDB 
        // In production, you should fetch this from your API
        setStats({
          habitStreak: 0,
          tasksCompleted: 0,
          tasksRemaining: 5, // Based on your MongoDB data
          healthMetrics: 0,
          financeTransactions: 165, // Based on your MongoDB data
          contentItems: 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Mesh OS</title>
      </Head>
      
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <span className="ml-3">Loading dashboard...</span>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500">{error}</div>
      ) : (
        <>
          <div className="px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Welcome back - here's what you need to know today
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="px-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Stats Cards */}
            <Link href="/habits" legacyBehavior>
              <a className="block">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Current Habit Streak</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats.habitStreak} days</dd>
                  </div>
                </div>
              </a>
            </Link>

            <Link href="/tasks" legacyBehavior>
              <a className="block">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Tasks Remaining</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats.tasksRemaining}</dd>
                  </div>
                </div>
              </a>
            </Link>

            <Link href="/health" legacyBehavior>
              <a className="block">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Health Metrics</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats.healthMetrics}</dd>
                  </div>
                </div>
              </a>
            </Link>

            <Link href="/finance" legacyBehavior>
              <a className="block">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Finance Transactions</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats.financeTransactions}</dd>
                  </div>
                </div>
              </a>
            </Link>

            <Link href="/content" legacyBehavior>
              <a className="block">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Content Items</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats.contentItems}</dd>
                  </div>
                </div>
              </a>
            </Link>
          </div>

          {/* Main Sections */}
          <div className="px-4 mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Priority Tasks */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Priority Tasks</h3>
              </div>
              <div className="px-4 py-3">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Go to the Tasks section to manage your tasks</p>
              </div>
            </div>

            {/* Daily Habits */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Daily Habits</h3>
              </div>
              <div className="px-4 py-3">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Go to the Habits section to track your habits</p>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
