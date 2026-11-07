import {
  themeFromSourceColor,
  argbFromHex,
  hexFromArgb,
} from '@material/material-color-utilities';

export interface ThemeConfig {
  seedColor: string;
  isDark: boolean;
}

export const PRESET_SEED_COLORS = [
  { name: 'M3 Purple (Baseline)', hex: '#6750A4' },
  { name: 'Ocean Blue', hex: '#0061A4' },
  { name: 'Forest Teal', hex: '#006A60' },
  { name: 'Sunset Terracotta', hex: '#A23F15' },
  { name: 'Emerald Green', hex: '#2E6C38' },
  { name: 'Rose Pink', hex: '#9C4146' },
  { name: 'Golden Amber', hex: '#775A00' },
];

/**
 * Generate standard M3 design tokens for a given seed hex color and dark/light mode.
 * In M3, surface container roles (lowest, low, container, high, highest) are derived from the neutral palette:
 * Light:
 * - surface: tone 98
 * - surface-dim: tone 87
 * - surface-bright: tone 98
 * - surface-container-lowest: tone 100
 * - surface-container-low: tone 96
 * - surface-container: tone 94
 * - surface-container-high: tone 92
 * - surface-container-highest: tone 90
 * Dark:
 * - surface: tone 6
 * - surface-dim: tone 6
 * - surface-bright: tone 24
 * - surface-container-lowest: tone 4
 * - surface-container-low: tone 10
 * - surface-container: tone 12
 * - surface-container-high: tone 17
 * - surface-container-highest: tone 22
 */
export function generateM3ThemeTokens(seedHex: string, isDark: boolean): Record<string, string> {
  const theme = themeFromSourceColor(argbFromHex(seedHex));
  const scheme = isDark ? theme.schemes.dark : theme.schemes.light;
  const neutral = theme.palettes.neutral;

  const surfaceContainerTokens = isDark
    ? {
        '--md-sys-color-surface-dim': hexFromArgb(neutral.tone(6)),
        '--md-sys-color-surface': hexFromArgb(neutral.tone(6)),
        '--md-sys-color-surface-bright': hexFromArgb(neutral.tone(24)),
        '--md-sys-color-surface-container-lowest': hexFromArgb(neutral.tone(4)),
        '--md-sys-color-surface-container-low': hexFromArgb(neutral.tone(10)),
        '--md-sys-color-surface-container': hexFromArgb(neutral.tone(12)),
        '--md-sys-color-surface-container-high': hexFromArgb(neutral.tone(17)),
        '--md-sys-color-surface-container-highest': hexFromArgb(neutral.tone(22)),
      }
    : {
        '--md-sys-color-surface-dim': hexFromArgb(neutral.tone(87)),
        '--md-sys-color-surface': hexFromArgb(neutral.tone(98)),
        '--md-sys-color-surface-bright': hexFromArgb(neutral.tone(98)),
        '--md-sys-color-surface-container-lowest': hexFromArgb(neutral.tone(100)),
        '--md-sys-color-surface-container-low': hexFromArgb(neutral.tone(96)),
        '--md-sys-color-surface-container': hexFromArgb(neutral.tone(94)),
        '--md-sys-color-surface-container-high': hexFromArgb(neutral.tone(92)),
        '--md-sys-color-surface-container-highest': hexFromArgb(neutral.tone(90)),
      };

  const tokens: Record<string, string> = {
    '--md-sys-color-primary': hexFromArgb(scheme.primary),
    '--md-sys-color-on-primary': hexFromArgb(scheme.onPrimary),
    '--md-sys-color-primary-container': hexFromArgb(scheme.primaryContainer),
    '--md-sys-color-on-primary-container': hexFromArgb(scheme.onPrimaryContainer),

    '--md-sys-color-secondary': hexFromArgb(scheme.secondary),
    '--md-sys-color-on-secondary': hexFromArgb(scheme.onSecondary),
    '--md-sys-color-secondary-container': hexFromArgb(scheme.secondaryContainer),
    '--md-sys-color-on-secondary-container': hexFromArgb(scheme.onSecondaryContainer),

    '--md-sys-color-tertiary': hexFromArgb(scheme.tertiary),
    '--md-sys-color-on-tertiary': hexFromArgb(scheme.onTertiary),
    '--md-sys-color-tertiary-container': hexFromArgb(scheme.tertiaryContainer),
    '--md-sys-color-on-tertiary-container': hexFromArgb(scheme.onTertiaryContainer),

    '--md-sys-color-error': hexFromArgb(scheme.error),
    '--md-sys-color-on-error': hexFromArgb(scheme.onError),
    '--md-sys-color-error-container': hexFromArgb(scheme.errorContainer),
    '--md-sys-color-on-error-container': hexFromArgb(scheme.onErrorContainer),

    '--md-sys-color-background': hexFromArgb(scheme.background),
    '--md-sys-color-on-background': hexFromArgb(scheme.onBackground),

    '--md-sys-color-on-surface': hexFromArgb(scheme.onSurface),
    '--md-sys-color-surface-variant': hexFromArgb(scheme.surfaceVariant),
    '--md-sys-color-on-surface-variant': hexFromArgb(scheme.onSurfaceVariant),

    '--md-sys-color-outline': hexFromArgb(scheme.outline),
    '--md-sys-color-outline-variant': hexFromArgb(scheme.outlineVariant),
    '--md-sys-color-shadow': hexFromArgb(scheme.shadow),
    '--md-sys-color-scrim': hexFromArgb(scheme.scrim),

    '--md-sys-color-inverse-surface': hexFromArgb(scheme.inverseSurface),
    '--md-sys-color-inverse-on-surface': hexFromArgb(scheme.inverseOnSurface),
    '--md-sys-color-inverse-primary': hexFromArgb(scheme.inversePrimary),

    // Surface tint is primary color
    '--md-sys-color-surface-tint': hexFromArgb(scheme.primary),

    ...surfaceContainerTokens,
  };

  return tokens;
}

const STORAGE_KEY = 'm3_todo_theme_config';

export class ThemeEngine {
  private config: ThemeConfig;
  private listeners: Array<(config: ThemeConfig) => void> = [];

  constructor() {
    this.config = this.loadConfig();
    this.applyTheme();
  }

  private loadConfig(): ThemeConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      seedColor: '#6750A4',
      isDark: prefersDark,
    };
  }

  public getConfig(): ThemeConfig {
    return { ...this.config };
  }

  public setSeedColor(hex: string): void {
    this.config.seedColor = hex;
    this.saveAndApply();
  }

  public toggleDarkMode(): void {
    this.config.isDark = !this.config.isDark;
    this.saveAndApply();
  }

  public setDarkMode(isDark: boolean): void {
    this.config.isDark = isDark;
    this.saveAndApply();
  }

  public subscribe(callback: (config: ThemeConfig) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private saveAndApply(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // ignore
    }
    this.applyTheme();
    for (const listener of this.listeners) {
      listener(this.getConfig());
    }
  }

  public applyTheme(): void {
    const tokens = generateM3ThemeTokens(this.config.seedColor, this.config.isDark);
    const root = document.documentElement;

    for (const [property, value] of Object.entries(tokens)) {
      root.style.setProperty(property, value);
    }

    if (this.config.isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }
}

export const themeEngine = new ThemeEngine();
