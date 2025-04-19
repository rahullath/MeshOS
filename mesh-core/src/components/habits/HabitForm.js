// src/components/habits/HabitForm.js
import { useState } from 'react';

export default function HabitForm({ onSubmit, onCancel }) {
  const [habit, setHabit] = useState({
    name: '',
    category: 'general',
    type: 'positive',
    frequency: 'daily',
    notes: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHabit(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(habit);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Habit Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={habit.name}
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            name="category"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={habit.category}
            onChange={handleChange}
          >
            <option value="general">General</option>
            <option value="health">Health</option>
            <option value="productivity">Productivity</option>
            <option value="mental">Mental Wellbeing</option>
            <option value="social">Social</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
          <select
            id="type"
            name="type"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={habit.type}
            onChange={handleChange}
          >
            <option value="positive">Positive (Build)</option>
            <option value="negative">Negative (Quit)</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency</label>
        <select
          id="frequency"
          name="frequency"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={habit.frequency}
          onChange={handleChange}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows="3"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={habit.notes}
          onChange={handleChange}
        ></textarea>
      </div>
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Habit
        </button>
      </div>
    </form>
  );
}
