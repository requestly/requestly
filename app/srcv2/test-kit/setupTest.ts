import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import "@testing-library/jest-dom";

/**
 * Setup file for Vitest tests in srcv2
 *
 * This file:
 * - Imports jest-dom matchers for better assertions
 * - Cleans up after each test
 * - Sets up global mocks and utilities
 */

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia (used by many React components)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver (used by virtualization libraries)
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
global.IntersectionObserver = (class IntersectionObserver {
  public root = null;
  public rootMargin = "";
  public thresholds: number[] = [];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public disconnect(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public observe(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public unobserve(): void {}
  public takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as unknown) as typeof IntersectionObserver;

// Mock ResizeObserver (used by many UI libraries)
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
global.ResizeObserver = (class ResizeObserver {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public disconnect(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public observe(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public unobserve(): void {}
} as unknown) as typeof ResizeObserver;

// Suppress console errors in tests (optional - comment out if you want to see them)
// global.console.error = vi.fn();
// global.console.warn = vi.fn();
