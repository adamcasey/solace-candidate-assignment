// Test setup file
// This runs before all tests

// Load environment variables
import { config } from 'dotenv';
config();

// Ensure DATABASE_URL is set for tests
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set for tests');
}
