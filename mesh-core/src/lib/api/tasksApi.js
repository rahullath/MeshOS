// mesh-core/src/lib/api/tasksApi.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create an axios instance with default headers
const api = axios.create({
  baseURL: `${API_URL}/api/tasks`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all tasks with optional filters
export const getAllTasks = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add any filters to the query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Get task by ID
export const getTaskById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task ${id}:`, error);
    throw error;
  }
};

// Create new task
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update task
export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    throw error;
  }
};

// Delete task
export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    throw error;
  }
};

// Toggle task completion status
export const toggleTaskStatus = async (id) => {
  try {
    const response = await api.patch(`/${id}/toggle`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling task status ${id}:`, error);
    throw error;
  }
};

// Update subtask completion status
export const updateSubtask = async (taskId, subtaskId, completed) => {
  try {
    const response = await api.patch(`/${taskId}/subtask`, {
      subtaskId,
      completed
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating subtask in task ${taskId}:`, error);
    throw error;
  }
};

// Get task statistics
export const getTaskStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching task stats:', error);
    throw error;
  }
};

export default {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  updateSubtask,
  getTaskStats,
};