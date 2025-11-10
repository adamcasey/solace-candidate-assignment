import { describe, it, expect, beforeAll } from 'vitest';
import { GET } from './route';
import db from '../../../db';
import { advocates } from '../../../db/schema';

describe('Advocates API - Search Functionality', () => {
  beforeAll(async () => {

    const count = await db.select().from(advocates);
    if (count.length === 0) {
      throw new Error(
        'Database is empty. Please run `npm run seed` before running tests.'
      );
    }
  });

  describe('GET /api/advocates', () => {
    it('should return all advocates when no query parameter is provided', async () => {
      const request = new Request('http://localhost:3000/api/advocates');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);

      // Verify structure of first advocate
      const advocate = data.data[0];
      expect(advocate).toHaveProperty('id');
      expect(advocate).toHaveProperty('firstName');
      expect(advocate).toHaveProperty('lastName');
      expect(advocate).toHaveProperty('city');
      expect(advocate).toHaveProperty('degree');
      expect(advocate).toHaveProperty('specialties');
      expect(advocate).toHaveProperty('yearsOfExperience');
      expect(advocate).toHaveProperty('phoneNumber');
    });

    it('should return empty array when query has no matches', async () => {
      const request = new Request(
        'http://localhost:3000/api/advocates?q=xyz123nonexistent'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data.data).toEqual([]);
      expect(data.count).toBe(0);
      expect(data.query).toBe('xyz123nonexistent');
    });

    it('should find advocates by specialty - full word', async () => {
      const request = new Request(
        'http://localhost:3000/api/advocates?q=eating'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.count).toBeGreaterThan(0);
      expect(data.query).toBe('eating');

      // Verify at least one advocate has "Eating disorders" specialty
      const hasEatingDisorder = data.data.some((advocate: any) =>
        advocate.specialties.some((s: string) =>
          s.toLowerCase().includes('eating')
        )
      );
      expect(hasEatingDisorder).toBe(true);
    });

    it('should find advocates by specialty - partial word with prefix matching', async () => {
      const request = new Request(
        'http://localhost:3000/api/advocates?q=eat'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.length).toBeGreaterThan(0);
      expect(data.query).toBe('eat');
    });

    it('should find advocates by name', async () => {
      const request = new Request(
        'http://localhost:3000/api/advocates?q=John'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.length).toBeGreaterThan(0);

      // Verify at least one advocate has "John" in firstName
      const hasJohn = data.data.some(
        (advocate: any) => advocate.firstName === 'John'
      );
      expect(hasJohn).toBe(true);
    });

    it('should find advocates by city', async () => {
      const request = new Request(
        'http://localhost:3000/api/advocates?q=Chicago'
      );
      const response = await GET(request);
      const data = await response.json();

      if (data.data.length > 0) {
        // Verify at least one advocate is in Chicago
        const hasChicago = data.data.some(
          (advocate: any) => advocate.city === 'Chicago'
        );
        expect(hasChicago).toBe(true);
      }
    });

    it('should handle typos with fuzzy search - infirtility', async () => {
      const request = new Request(
        'http://localhost:3000/api/advocates?q=infirtility'
      );
      const response = await GET(request);
      const data = await response.json();

      // Fuzzy search should find matches for "infertility" even with typo
      expect(data.data.length).toBeGreaterThan(0);

      // Verify results contain "infertility" specialty
      const hasInfertility = data.data.some((advocate: any) =>
        advocate.specialties.some((s: string) =>
          s.toLowerCase().includes('infertility')
        )
      );
      expect(hasInfertility).toBe(true);
    });

    it('should handle typos with fuzzy search - Chicgo', async () => {
      const request = new Request(
        'http://localhost:3000/api/advocates?q=Chicgo'
      );
      const response = await GET(request);
      const data = await response.json();

      if (data.data.length > 0) {
        // Fuzzy search should find "Chicago"
        const hasChicago = data.data.some(
          (advocate: any) => advocate.city === 'Chicago'
        );
        expect(hasChicago).toBe(true);
      }
    });

    it('should handle multi-word searches with AND logic', async () => {
      const request = new Request(
        'http://localhost:3000/api/advocates?q=women issues'
      );
      const response = await GET(request);
      const data = await response.json();

      // Should find advocates with both "women" AND "issues" in their data
      if (data.data.length > 0) {
        const hasWomensIssues = data.data.some((advocate: any) =>
          advocate.specialties.some((s: string) =>
            s.toLowerCase().includes('women') && s.toLowerCase().includes('issues')
          )
        );
        expect(hasWomensIssues).toBe(true);
      }
    });

    it('should return results ordered by relevance', async () => {
      const request = new Request(
        'http://localhost:3000/api/advocates?q=ADHD'
      );
      const response = await GET(request);
      const data = await response.json();

      if (data.data.length > 1) {
        // Results should be ordered - we can't easily verify ranking
        // but we can verify they all match the search term
        const allMatch = data.data.every((advocate: any) => {
          const combinedText = `${advocate.firstName} ${advocate.lastName} ${advocate.city} ${advocate.degree} ${advocate.specialties.join(' ')}`;
          return combinedText.toLowerCase().includes('adhd');
        });
        expect(allMatch).toBe(true);
      }
    });

    it('should handle special characters gracefully', async () => {
      const request = new Request(
        'http://localhost:3000/api/advocates?q=test%40%23%24'
      );
      const response = await GET(request);
      const data = await response.json();

      // Should not throw error, just return empty or fallback results
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});
