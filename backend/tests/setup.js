import { jest } from '@jest/globals';

// Mock Firebase for testing
jest.mock('../src/firebase.js', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  }
}));

// Global test setup
beforeAll(async () => {
  // Setup code if needed
});

afterAll(async () => {
  // Cleanup code if needed
});