import { useState, useEffect } from 'react';
import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import CsvImporter from '../components/import/CsvImporter';
import HealthImporter from '../components/import/HealthImporter';
import FinanceImporter from '../components/import/FinanceImporter';
import UkApplicationImporter from '../components/import/UkApplicationImporter';

export default function Dashboard() {
  const [stats, setStats] = useState({
    habitStreak: 0,
    tasksCompleted: 0,
    tasksRemaining: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, you'd fetch this data from your API
        const habitStreakResponse = await axios.get('/api/habits/streak');
        const tasksCompletedResponse = await axios.get('/api/tasks/completed');
        const tasksRemainingResponse = await axios.get('/api/tasks/remaining');

        setStats({
          habitStreak: habitStreakResponse.data?.streak || 0,
          tasksCompleted: tasksCompletedResponse.data?.count || 0,
          tasksRemaining: tasksRemainingResponse.data?.count || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Life Dashboard</title>
      </Head>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-lg">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back - here&#39;s what you need to know today</p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Stats Cards */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Current Habit Streak</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.habitStreak} days</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Tasks Completed</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.tasksCompleted}</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Tasks Remaining</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.tasksRemaining} days</dd>
              </div>
            </div>
          </div>

          {/* Main Sections */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Priority Tasks */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Priority Tasks</h3>
              </div>
              <div className="px-4 py-3">
                <p className="text-gray-500 text-sm">You&#39;ll add task components here...</p>
                {/* Task List Component will go here */}
              </div>
            </div>

            {/* Daily Habits */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Daily Habits</h3>
              </div>
              <div className="px-4 py-3">
                <p className="text-gray-500 text-sm">Your habits will appear here...</p>
                {/* Habit tracker component will go here */}
              </div>
            </div>
          </div>
          <CsvImporter />
          <HealthImporter />
          <FinanceImporter />
          <UkApplicationImporter />
        </>
      )}
    </Layout>
  );
}
