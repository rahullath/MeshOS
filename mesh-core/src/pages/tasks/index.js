import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';
import TaskList from '../../components/tasks/TaskList'; // Import the TaskList component

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

  // Fetch tasks from the API
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Construct query parameters from filters
        const queryParams = new URLSearchParams();
        if (filters.status !== 'all') queryParams.append('status', filters.status);
        if (filters.category !== 'all') queryParams.append('category', filters.category);
        if (filters.dueDate !== 'all') queryParams.append('due', filters.dueDate); // Assuming 'due' is the query param name based on api/tasks/index.js
        
        const apiUrl = `/api/tasks?${queryParams.toString()}`;
        
        console.log("Fetching tasks from:", apiUrl);

        const response = await fetch(apiUrl, {
             credentials: "include", // Ensure cookies are sent for authentication
        });

        if (!response.ok) {
          // If the response is not OK, throw an error with the status
          const errorData = await response.json();
          throw new Error(`Error fetching tasks: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log("Fetched tasks data:", data);
        // Assuming the API returns an object with a 'tasks' array
        setTasks(data.tasks || []); 

      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(`Failed to load tasks: ${err.message}`);
        setTasks([]); // Clear tasks on error
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    // Re-fetch tasks whenever filters change
  }, [filters.status, filters.category, filters.dueDate]); // Dependency array

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleAddTask = () => {
    router.push('/tasks/new');
  };

  // We no longer need the getStatusColor and formatDate here as they are in TaskList component

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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label 
                htmlFor="status-filter" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Status
              </label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="form-control dropdown-select w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label 
                htmlFor="category-filter" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Category
              </label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange({ category: e.target.value })}
                className="form-control dropdown-select w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="work">Work</option>
                <option value="job_application">Job Application</option>
                <option value="university">University</option>
                <option value="project">Project</option>
                <option value="personal">Personal</option>
                <option value="cat">Cat Related</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Due Date Filter */}
            <div>
              <label 
                htmlFor="dueDate-filter" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Due Date
              </label>
              <select
                id="dueDate-filter"
                value={filters.dueDate}
                onChange={(e) => handleFilterChange({ dueDate: e.target.value })}
                className="form-control dropdown-select w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Due Dates</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="overdue">Overdue</option>
                <option value="future">Future</option> {/* Added future filter based on API */}
                <option value="none">No Due Date</option> {/* Added none filter based on API */}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Loading tasks...</span>
          </div>
        ) : (
          // Use the TaskList component to render tasks
          <TaskList tasks={tasks} />
        )}
         {!loading && tasks.length === 0 && !error && (
           <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
             <p className="text-gray-500 dark:text-gray-400">No tasks found with the current filters.</p>
           </div>
         )}
      </div>
    </Layout>
  );
}
