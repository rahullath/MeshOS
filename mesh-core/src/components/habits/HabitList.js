import React from 'react';

const HabitList = ({ habits }) => {
  return (
    <ul>
      {habits.map((habit) => (
        <li key={habit.id}>{habit.name}</li>
      ))}
    </ul>
  );
};

export default HabitList;
