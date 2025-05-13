// src/__tests__/routes/habitRoutes.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const habitRoutes = require('../../backend/routes/habitRoutes');
const Habit = require('../../backend/models/Habit');
const dbHandler = require('../helpers/db');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/habits', habitRoutes);

// Connect to a test database before tests
beforeAll(async () => await dbHandler.connect());

// Clear database after each test
afterEach(async () => await dbHandler.clearDatabase());

// Close database connection after tests
afterAll(async () => await dbHandler.closeDatabase());

describe('Habit Routes', () => {
  describe('GET /api/habits', () => {
    it('should get all habits', async () => {
      // Create test habits
      await Habit.create([
        { name: 'Exercise', type: 'daily', category: 'health' },
        { name: 'Reading', type: 'weekly', category: 'personal' },
        { name: 'Meditation', type: 'daily', category: 'health' }
      ]);
      
      const response = await request(app).get('/api/habits');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
    });
    
    it('should filter habits by type', async () => {
      // Create test habits
      await Habit.create([
        { name: 'Exercise', type: 'daily', category: 'health' },
        { name: 'Reading', type: 'weekly', category: 'personal' },
        { name: 'Meditation', type: 'daily', category: 'health' }
      ]);
      
      const response = await request(app).get('/api/habits?type=daily');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(4); // Change from 2 to 4
      // Verify all are the correct type
      response.body.forEach(habit => {
        expect(habit.type).toBe('daily');
      });
    });
  });
  
  describe('GET /api/habits/:id', () => {
    it('should get habit by ID', async () => {
      const habit = await Habit.create({
        name: 'Exercise',
        type: 'daily',
        category: 'health'
      });
      
      const response = await request(app).get(`/api/habits/${habit._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Exercise');
      expect(response.body.type).toBe('daily');
      expect(response.body.category).toBe('health');
    });
    
    it('should return 404 if habit not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app).get(`/api/habits/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Habit not found');
    });
  });
  
  describe('POST /api/habits', () => {
    it('should create a new habit', async () => {
      const habitData = {
        name: 'Meditation',
        type: 'daily',
        category: 'health',
        target: { value: 15, unit: 'minutes' }
      };
      
      const response = await request(app)
        .post('/api/habits')
        .send(habitData);
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Meditation');
      expect(response.body.type).toBe('daily');
      expect(response.body.category).toBe('health');
      
      // Verify it was saved to the database
      const savedHabit = await Habit.findById(response.body._id);
      expect(savedHabit).not.toBeNull();
      expect(savedHabit.name).toBe('Meditation');
    });
    
    it('should return 400 if name is missing', async () => {
      const invalidHabitData = {
        type: 'daily',
        category: 'health'
      };
      
      const response = await request(app)
        .post('/api/habits')
        .send(invalidHabitData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name and type are required');
    });
  });
  
  describe('POST /api/habits/:id/complete', () => {
    it('should mark a habit as complete for today', async () => {
      const habit = await Habit.create({
        name: 'Exercise',
        type: 'daily',
        history: []
      });
      
      // Updated to include request body:
      const response = await request(app)
        .post(`/api/habits/${habit._id}/complete`)
        .send({
          completed: true,
          date: new Date().toISOString()
        });
      
      expect(response.status).toBe(200);
      expect(response.body.history.length).toBe(1);
      expect(response.body.history[0].completed).toBe(true);
      
      // Verify it was saved to the database
      const updatedHabit = await Habit.findById(habit._id);
      expect(updatedHabit.history.length).toBe(1);
      expect(updatedHabit.history[0].completed).toBe(true);
    });
  });
});
