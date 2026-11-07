import { describe, it, expect, beforeEach } from 'vitest';
import { generateM3ThemeTokens, ThemeEngine, PRESET_SEED_COLORS } from '../src/theme/theme-engine';

describe('ThemeEngine & Dynamic Color System', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.cssText = '';
  });

  it('generates essential Material 3 color tokens for light mode', () => {
    const tokens = generateM3ThemeTokens('#6750A4', false);
    expect(tokens['--md-sys-color-primary']).toBeDefined();
    expect(tokens['--md-sys-color-surface-container']).toBeDefined();
    expect(tokens['--md-sys-color-on-surface']).toBeDefined();
    expect(tokens['--md-sys-color-surface-container-high']).toBeDefined();
  });

  it('generates distinct tokens for dark mode', () => {
    const lightTokens = generateM3ThemeTokens('#6750A4', false);
    const darkTokens = generateM3ThemeTokens('#6750A4', true);

    expect(lightTokens['--md-sys-color-primary']).not.toBe(darkTokens['--md-sys-color-primary']);
    expect(lightTokens['--md-sys-color-surface']).not.toBe(darkTokens['--md-sys-color-surface']);
  });

  it('applies tokens to document root when seed color changes', () => {
    const engine = new ThemeEngine();
    engine.setSeedColor('#0061A4'); // Ocean Blue
    const currentConfig = engine.getConfig();
    expect(currentConfig.seedColor).toBe('#0061A4');

    const primaryColor = document.documentElement.style.getPropertyValue('--md-sys-color-primary');
    expect(primaryColor).toBeTruthy();
  });

  it('toggles dark mode correctly and updates class list', () => {
    const engine = new ThemeEngine();
    engine.setDarkMode(false);
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    engine.toggleDarkMode();
    expect(engine.getConfig().isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('contains presets with valid hex colors', () => {
    expect(PRESET_SEED_COLORS.length).toBeGreaterThan(0);
    for (const preset of PRESET_SEED_COLORS) {
      expect(preset.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
