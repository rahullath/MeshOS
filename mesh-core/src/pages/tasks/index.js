import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/layout/Layout'; // Fixed import path
import TaskList from '../../components/tasks/TaskList';
import TaskFilters from '../../components/tasks/TaskFilters';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    dueDate: 'all'
  });
  
  const router = useRouter();

  // Fixed fetch function to prevent infinite loops
  useEffect(() => {
    // Define fetchTasks inside useEffect to prevent recreating it on every render
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.status !== 'all') queryParams.append('status', filters.status);
        if (filters.category !== 'all') queryParams.append('category', filters.category);
        if (filters.dueDate !== 'all') queryParams.append('dueDate', filters.dueDate);
        
        const queryString = queryParams.toString();
        const url = `/api/tasks${queryString ? `?${queryString}` : ''}`;
        
        console.log(`Fetching tasks from: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          // Try to parse error message
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch tasks: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Tasks data received:', data);
        
        // Check if the data has the expected structure
        if (Array.isArray(data)) {
          setTasks(data);
        } else if (data.tasks && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        } else {
          console.warn('Unexpected task data format:', data);
          setTasks([]);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to load tasks');
        // Set empty array to prevent endless loading state
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    // Only re-fetch when filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.category, filters.dueDate]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleAddTask = () => {
    router.push('/tasks/new');
  };

  const handleRefresh = () => {
    // To force a refresh, toggle a filter and then back
    const tempFilters = {...filters};
    setFilters({...filters, status: filters.status === 'all' ? 'pending' : 'all'});
    setTimeout(() => setFilters(tempFilters), 100);
  };

  return (
    <Layout>
      <Head>
        <title>Task Management | MeshOS</title>
      </Head>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h1>
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Task
          </button>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Manage all your tasks, projects, and applications
        </p>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Filter Tasks</h2>
          <TaskFilters onFilterChange={handleFilterChange} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Loading tasks...</span>
          </div>
        ) : (
          <TaskList tasks={tasks} onRefresh={handleRefresh} />
        )}
      </div>
    </Layout>
  );
}
