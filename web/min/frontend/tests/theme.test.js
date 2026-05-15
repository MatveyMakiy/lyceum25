import { beforeEach, describe, expect, it } from 'vitest';
import {
  applySavedTheme,
  getCurrentTheme,
  toggleTheme,
} from '../src/utils/theme.js';

describe('theme utils', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
  });
  it('uses light theme by default', () => {
    applySavedTheme();
    expect(document.body.classList.contains('dark-theme')).toBe(false);
    expect(getCurrentTheme()).toBe('light');
  });
  it('applies saved dark theme', () => {
    localStorage.setItem('theme', 'dark');
    applySavedTheme();
    expect(document.body.classList.contains('dark-theme')).toBe(true);
    expect(getCurrentTheme()).toBe('dark');
  });
  it('toggles theme and saves it', () => {
    const theme = toggleTheme();
    expect(theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.body.classList.contains('dark-theme')).toBe(true);
    const nextTheme = toggleTheme();
    expect(nextTheme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });
});