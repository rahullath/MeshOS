import { useState, useEffect } from 'react';

const TaskFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    dueDate: 'all'
  });

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  return (
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
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="form-control dropdown-select w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
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
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="form-control dropdown-select w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="university">University</option>
          <option value="health">Health</option>
          <option value="finance">Finance</option>
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
          onChange={(e) => handleFilterChange('dueDate', e.target.value)}
          className="form-control dropdown-select w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Due Dates</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="this-week">This Week</option>
          <option value="this-month">This Month</option>
          <option value="overdue">Overdue</option>
          <option value="no-date">No Due Date</option>
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;
