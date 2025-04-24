import { useState, useEffect } from 'react';
import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import CsvImporter from '../components/import/CsvImporter';
import HealthImporter from '../components/import/HealthImporter';
import FinanceImporter from '../components/import/FinanceImporter';
import axios from 'axios';
import UkApplicationImporter from '../components/import/UkApplicationImporter';
import TaskStats from '../components/tasks/TaskStats';
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
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, you'd fetch this data from your API
        const habitStreakResponse = await axios.get('/api/habits/streak');
        const tasksResponse = await axios.get('/api/tasks');
        const tasksCompletedResponse = await axios.get('/api/tasks/completed');
        const tasksRemainingResponse = await axios.get('/api/tasks/remaining');
        const healthMetricsResponse = await axios.get('/api/health'); // Replace with actual API endpoint
        const financeTransactionsResponse = await axios.get('/api/finance'); // Replace with actual API endpoint
         const contentItemsResponse = await axios.get('/api/content'); // Replace with actual API endpoint

        setStats({
          habitStreak: habitStreakResponse.data?.streak || 0,
          tasksCompleted: tasksCompletedResponse.data?.count || 0,
          tasksRemaining: tasksRemainingResponse.data?.count || 0,
          healthMetrics: healthMetricsResponse.data?.count || 0,
          financeTransactions: financeTransactionsResponse.data?.count || 0,
           contentItems: contentItemsResponse.data?.count || 0
        });
        setTasks(tasksResponse.data);
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
        <title>Mesh OS</title>
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
            <Link href="/habits">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Current Habit Streak</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.habitStreak} days</dd>
              </div>
            </div>
            </Link>

           <Link href="/tasks">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Tasks Completed</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.tasksCompleted}</dd>
              </div>
            </div>
            </Link>

            <Link href="/health">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Health Metrics</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.healthMetrics}</dd>
              </div>
            </div>
            </Link>

             <Link href="/finance">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Finance Transactions</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.financeTransactions}</dd>
              </div>
            </div>
            </Link>

             <Link href="/content">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Content Items</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.contentItems}</dd>
              </div>
            </div>
            </Link>
            {/*<div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <TaskStats tasks={tasks} />
              </div>
            </div>*/}
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
        </>
      )}
    </Layout>
  );
}
