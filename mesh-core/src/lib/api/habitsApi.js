// mesh-core/src/lib/api/habitsApi.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create an axios instance with default headers
const api = axios.create({
  baseURL: `${API_URL}/api/habits`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all habits with optional filters
export const getAllHabits = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add any filters to the query params
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    
    const response = await api.get(`/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
};

// Get habit by ID
export const getHabitById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching habit ${id}:`, error);
    throw error;
  }
};

// Create new habit
export const createHabit = async (habitData) => {
  try {
    const response = await api.post('/', habitData);
    return response.data;
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
};

// Update habit
export const updateHabit = async (id, habitData) => {
  try {
    const response = await api.put(`/${id}`, habitData);
    return response.data;
  } catch (error) {
    console.error(`Error updating habit ${id}:`, error);
    throw error;
  }
};

// Delete habit
export const deleteHabit = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting habit ${id}:`, error);
    throw error;
  }
};

// Complete habit for today
export const completeHabit = async (id, data = {}) => {
  try {
    const response = await api.post(`/${id}/complete`, data);
    return response.data;
  } catch (error) {
    console.error(`Error completing habit ${id}:`, error);
    throw error;
  }
};

// Get habit statistics
export const getHabitStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching habit stats:', error);
    throw error;
  }
};

// Import habits from CSV
export const importFromCSV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('csv', file);
    
    const response = await axios.post(`${API_URL}/api/habits/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error importing habits from CSV:', error);
    throw error;
  }
};

export default {
  getAllHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  getHabitStats,
  importFromCSV,
};