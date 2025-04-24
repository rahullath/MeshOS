import React, { useState } from 'react';

const SleepTracker = () => {
  const [sleepData, setSleepData] = useState({
    startTime: '',
    endTime: '',
    quality: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSleepData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement sleep data submission logic here
    console.log('Sleep data submitted:', sleepData);
  };

  return (
    <div>
      <h3>Sleep Tracker</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="startTime">Start Time:</label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={sleepData.startTime}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="endTime">End Time:</label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            value={sleepData.endTime}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="quality">Quality:</label>
          <select
            id="quality"
            name="quality"
            value={sleepData.quality}
            onChange={handleChange}
          >
            <option value="">Select Quality</option>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="poor">Poor</option>
          </select>
        </div>
        <button type="submit">Add Sleep Data</button>
      </form>
    </div>
  );
};

export default SleepTracker;
