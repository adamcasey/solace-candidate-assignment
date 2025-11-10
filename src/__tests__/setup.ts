import { config } from 'dotenv';
import '@testing-library/jest-dom';

config();

if (process.env.NODE_ENV === 'test' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set for integration tests');
}
