// src/__tests__/controllers/habitsController.test.js
const mongoose = require('mongoose');
const Habit = require('../../backend/models/Habit');
const habitsController = require('../../backend/controllers/habitsController');
const dbHandler = require('../helpers/db');

// Mock request and response objects
const mockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Connect to a test database before tests
beforeAll(async () => await dbHandler.connect());

// Clear database after each test
afterEach(async () => await dbHandler.clearDatabase());

// Close database connection after tests
afterAll(async () => await dbHandler.closeDatabase());

describe('Habits Controller', () => {
  describe('getAllHabits', () => {
    it('should get all habits', async () => {
      // Create test habits
      await Habit.create([
        { name: 'Exercise', type: 'daily', category: 'health' },
        { name: 'Reading', type: 'weekly', category: 'personal' },
        { name: 'Meditation', type: 'daily', category: 'health' }
      ]);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await habitsController.getAllHabits(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.length).toBe(3);
    });
    
    it('should filter habits by type', async () => {
      // Create test habits
      await Habit.create([
        { name: 'Exercise', type: 'daily', category: 'health' },
        { name: 'Reading', type: 'weekly', category: 'personal' },
        { name: 'Meditation', type: 'daily', category: 'health' }
      ]);
      
      const req = mockRequest({}, {}, { type: 'daily' });
      const res = mockResponse();
      
      await habitsController.getAllHabits(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.length).toBe(2);
      expect(responseData[0].type).toBe('daily');
      expect(responseData[1].type).toBe('daily');
    });
  });
  
  describe('getHabitById', () => {
    it('should get a habit by ID', async () => {
      const habit = await Habit.create({
        name: 'Exercise',
        type: 'daily',
        category: 'health'
      });
      
      const req = mockRequest({}, { id: habit._id.toString() });
      const res = mockResponse();
      
      await habitsController.getHabitById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.name).toBe('Exercise');
      expect(responseData.type).toBe('daily');
      expect(responseData.category).toBe('health');
    });
    
    it('should return 404 if habit not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const req = mockRequest({}, { id: nonExistentId.toString() });
      const res = mockResponse();
      
      await habitsController.getHabitById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Habit not found' });
    });
  });
  
  describe('createHabit', () => {
    it('should create a new habit', async () => {
      const habitData = {
        name: 'Meditation',
        type: 'daily',
        category: 'health',
        target: { value: 15, unit: 'minutes' }
      };
      
      const req = mockRequest(habitData);
      const res = mockResponse();
      
      await habitsController.createHabit(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.name).toBe('Meditation');
      expect(responseData.type).toBe('daily');
      expect(responseData.category).toBe('health');
      expect(responseData.target.value).toBe(15);
      expect(responseData.target.unit).toBe('minutes');
      
      // Verify it was saved to the database
      const savedHabit = await Habit.findById(responseData._id);
      expect(savedHabit).not.toBeNull();
      expect(savedHabit.name).toBe('Meditation');
    });
    
    it('should return 400 if name is missing', async () => {
      const invalidHabitData = {
        type: 'daily',
        category: 'health'
      };
      
      const req = mockRequest(invalidHabitData);
      const res = mockResponse();
      
      await habitsController.createHabit(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name and type are required' });
    });
  });
  
  describe('completeHabit', () => {
    it('should mark a habit as complete for today', async () => {
      const habit = await Habit.create({
        name: 'Exercise',
        type: 'daily',
        history: []
      });
      
      const req = mockRequest({}, { id: habit._id.toString() });
      const res = mockResponse();
      
      await habitsController.completeHabit(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.history.length).toBe(1);
      expect(responseData.history[0].completed).toBe(true);
      
      // Verify it was saved to the database
      const updatedHabit = await Habit.findById(habit._id);
      expect(updatedHabit.history.length).toBe(1);
      expect(updatedHabit.history[0].completed).toBe(true);
    });
    
    it('should update an existing entry for today', async () => {
      const today = new Date();
      
      const habit = await Habit.create({
        name: 'Exercise',
        type: 'daily',
        history: [{
          date: today,
          completed: false,
          notes: 'Initial entry'
        }]
      });
      
      const req = mockRequest(
        { completed: true, notes: 'Updated entry' }, 
        { id: habit._id.toString() }
      );
      const res = mockResponse();
      
      await habitsController.completeHabit(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      
      // Verify it was updated in the database
      const updatedHabit = await Habit.findById(habit._id);
      expect(updatedHabit.history.length).toBe(1);
      expect(updatedHabit.history[0].completed).toBe(true);
      expect(updatedHabit.history[0].notes).toBe('Updated entry');
    });
  });
});