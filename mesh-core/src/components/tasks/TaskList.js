import { useState } from 'react';
import Link from 'next/link';

export default function TaskList({ tasks = [], onRefresh }) {
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const toggleExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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

  // If no tasks, show empty state
  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new task.
        </p>
        <div className="mt-6">
          <Link href="/tasks/new">
            <a className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Task
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.map((task) => (
          <li key={task._id} className="task-item">
            <div className="px-6 py-4">
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
                  
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
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
                        {task.category}
                      </span>
                    )}
                    
                    {task.priority && (
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
                    )}
                  </div>
                </div>
                
                <div className="flex flex-shrink-0 ml-4">
                  <button
                    onClick={() => toggleExpand(task._id)}
                    className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none"
                  >
                    {expandedTaskId === task._id ? (
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  
                  <Link href={`/tasks/${task._id}`}>
                    <a className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </a>
                  </Link>
                </div>
              </div>
              
              {/* Expanded task details */}
              {expandedTaskId === task._id && (
                <div className="mt-4">
                  {task.description && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {task.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {task.createdAt && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Created</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(task.createdAt)}
                        </p>
                      </div>
                    )}
                    
                    {task.updatedAt && task.updatedAt !== task.createdAt && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Updated</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(task.updatedAt)}
                        </p>
                      </div>
                    )}
                    
                    {task.completedAt && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(task.completedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Link href={`/tasks/${task._id}`}>
                      <a className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        View Details
                      </a>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
