// src/__tests__/models/Habit.test.js
const mongoose = require('mongoose');
const Habit = require('../../backend/models/Habit');
const dbHandler = require('../helpers/db');

// Connect to a test database before tests
beforeAll(async () => await dbHandler.connect());

// Clear database after each test
afterEach(async () => await dbHandler.clearDatabase());

// Close database connection after tests
afterAll(async () => await dbHandler.closeDatabase());

describe('Habit Model', () => {
  it('should create & save a habit successfully', async () => {
    // Create a valid habit
    const validHabit = new Habit({
      name: 'Exercise',
      type: 'daily',
      category: 'health',
      target: {
        value: 30,
        unit: 'minutes'
      },
      history: [
        {
          date: new Date(),
          completed: true,
          notes: 'Went for a run'
        }
      ]
    });
    
    // Save the habit
    const savedHabit = await validHabit.save();
    
    // Object Id should be defined
    expect(savedHabit._id).toBeDefined();
    expect(savedHabit.name).toBe('Exercise');
    expect(savedHabit.type).toBe('daily');
    expect(savedHabit.category).toBe('health');
    expect(savedHabit.target.value).toBe(30);
    expect(savedHabit.target.unit).toBe('minutes');
    expect(savedHabit.history.length).toBe(1);
    expect(savedHabit.history[0].completed).toBe(true);
    expect(savedHabit.history[0].notes).toBe('Went for a run');
  });

  it('should fail to save habit without required name field', async () => {
    const habitWithoutName = new Habit({
      type: 'daily',
      category: 'health'
    });
    
    let error = null;
    try {
      await habitWithoutName.save();
    } catch (err) {
      error = err;
    }
    
    expect(error).not.toBeNull();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.name.kind).toBe('required');
  });

  it('should correctly calculate completion rate virtual field', async () => {
    const habit = new Habit({
      name: 'Meditation',
      type: 'daily',
      history: [
        { date: new Date('2023-01-01'), completed: true },
        { date: new Date('2023-01-02'), completed: true },
        { date: new Date('2023-01-03'), completed: false },
        { date: new Date('2023-01-04'), completed: true }
      ]
    });
    
    await habit.save();
    
    // 3 out of 4 days completed = 75%
    expect(habit.completionRate).toBe(75);
  });

  it('should correctly calculate current streak virtual field', async () => {
    // Create dates for the last 5 days
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const fourDaysAgo = new Date(today);
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    
    // Create a habit with a streak of 3 days (today, yesterday, day before)
    const habit = new Habit({
      name: 'Reading',
      type: 'daily',
      history: [
        { date: today, completed: true },
        { date: yesterday, completed: true },
        { date: dayBeforeYesterday, completed: true },
        { date: threeDaysAgo, completed: false }, // Break in streak
        { date: fourDaysAgo, completed: true }
      ]
    });
    
    await habit.save();
    
    // The streak should be 3 (today + 2 previous consecutive days)
    expect(habit.currentStreak).toBe(3);
  });

  it('should correctly handle streak with a missed day', async () => {
    // Create dates for the last 3 days
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dayBeforeYesterday = new Date();
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    
    // Create a habit with only yesterday marked (no entry for today yet)
    const habit = new Habit({
      name: 'Meditation',
      type: 'daily',
      history: [
        { date: yesterday, completed: true },
        { date: dayBeforeYesterday, completed: true }
      ]
    });
    
    await habit.save();
    
    // Streak should maintain for one day without entry
    expect(habit.currentStreak).toBe(2);
  });
});