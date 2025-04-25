import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';

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
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Instead of API call, use hardcoded data for now
        // This ensures we show something even if the API is unavailable
        const dummyTasks = [
          {
            _id: '1',
            title: 'Complete MeshOS MVP',
            description: 'Fix authentication and API issues in MeshOS application',
            status: 'in_progress',
            priority: 'high',
            category: 'work',
            dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
            createdAt: new Date()
          },
          {
            _id: '2',
            title: 'Apply to Universities',
            description: 'Submit applications to UK universities',
            status: 'pending',
            priority: 'urgent',
            category: 'university',
            dueDate: new Date(Date.now() + 86400000 * 14), // 14 days from now
            createdAt: new Date()
          },
          {
            _id: '3',
            title: 'Buy Cat Food',
            description: 'Get Royal Canin Hair & Skin Care for Marshall',
            status: 'todo',
            priority: 'medium',
            category: 'cat',
            dueDate: new Date(Date.now() + 86400000), // 1 day from now
            createdAt: new Date()
          },
          {
            _id: '4',
            title: 'Research Crypto Trading Bot',
            description: 'Look into algorithmic trading strategies for crypto',
            status: 'todo',
            priority: 'low',
            category: 'project',
            dueDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
            createdAt: new Date()
          },
          {
            _id: '5',
            title: 'Update Resume',
            description: 'Add recent projects and skills',
            status: 'done',
            priority: 'medium',
            category: 'job_application',
            completedDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
            createdAt: new Date(Date.now() - 86400000 * 5) // 5 days ago
          }
        ];
        
        // Apply filters to dummy data
        let filteredTasks = [...dummyTasks];
        
        if (filters.status !== 'all') {
          filteredTasks = filteredTasks.filter(task => task.status === filters.status);
        }
        
        if (filters.category !== 'all') {
          filteredTasks = filteredTasks.filter(task => task.category === filters.category);
        }
        
        // Due date filtering
        if (filters.dueDate !== 'all') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          
          if (filters.dueDate === 'today') {
            filteredTasks = filteredTasks.filter(task => {
              const taskDate = new Date(task.dueDate);
              return taskDate >= today && taskDate < tomorrow;
            });
          } else if (filters.dueDate === 'this-week') {
            filteredTasks = filteredTasks.filter(task => {
              const taskDate = new Date(task.dueDate);
              return taskDate >= today && taskDate < nextWeek;
            });
          } else if (filters.dueDate === 'overdue') {
            filteredTasks = filteredTasks.filter(task => {
              const taskDate = new Date(task.dueDate);
              return taskDate < today && task.status !== 'done';
            });
          }
        }
        
        setTasks(filteredTasks);
      } catch (err) {
        console.error('Error with tasks:', err);
        setError('An error occurred while loading tasks');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [filters.status, filters.category, filters.dueDate]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleAddTask = () => {
    router.push('/tasks/new');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'todo':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
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
                <option value="in_progress">In Progress</option>
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
                <option value="no-date">No Due Date</option>
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
        ) : tasks.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => (
                <li key={task._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <span
                          className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </div>
                      
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {task.description}
                      </p>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Due: {formatDate(task.dueDate)}
                        </span>
                        
                        {task.category && (
                          <span className="ml-4 flex items-center">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {task.category.replace('_', ' ')}
                          </span>
                        )}
                        
                        <span className="ml-4 flex items-center">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Priority: {task.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-shrink-0 ml-4">
                      <button
                        className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none"
                        title="View Task"
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <button
                        className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none"
                        title="Edit Task"
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
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
            <p className="text-gray-500 dark:text-gray-400">No tasks found with the current filters.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
