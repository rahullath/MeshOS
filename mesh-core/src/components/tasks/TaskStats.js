import React from 'react';

const TaskStats = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const incompleteTasks = totalTasks - completedTasks;

  return (
    <div>
      <h3>Task Statistics</h3>
      <p>Total Tasks: {totalTasks}</p>
      <p>Completed Tasks: {completedTasks}</p>
      <p>Incomplete Tasks: {incompleteTasks}</p>
    </div>
  );
};

export default TaskStats;
