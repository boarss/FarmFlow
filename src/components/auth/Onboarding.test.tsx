import { describe, it, expect } from 'vitest';
import { Onboarding } from './Onboarding';

describe('Onboarding Component', () => {
  it('is a valid React component function', () => {
    // Basic test to verify Vitest works without requiring testing-library DOM setup
    expect(typeof Onboarding).toBe('function');
  });
});
