import React, { useState, useEffect } from 'react';

const CodingProgress = () => {
  const [commitData, setCommitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommitData = async () => {
      try {
        setLoading(true);
        const githubId = 'rahullath'; // User's GitHub ID
        const response = await fetch(
          `https://api.github.com/users/${githubId}/events`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCommitData(data);
      } catch (error) {
        console.error('Error fetching commit data:', error);
        setError('Failed to load commit data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommitData();
  }, []);

  return (
    <div>
      <h3>Coding Progress</h3>
      {loading ? (
        <div>Loading coding progress data...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div>
          {/* Display coding progress data here */}
        </div>
      )}
    </div>
  );
};

export default CodingProgress;
