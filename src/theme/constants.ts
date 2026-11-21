import type { Theme } from './types';

export const THEME_CONTEXT_KEY = 'THEME_CONTEXT';

/** All available themes, in the order used by the cycle-theme button. */
export const THEMES: Theme[] = [
	'light',
	'dark',
	'dracula',
	'nord',
	'tokyo-night',
	'solarized',
	'catppuccin-latte',
	'gruvbox-light',
	'everforest'
];

/** Themes that must also toggle Tailwind's `dark` class on <body>. */
export const DARK_THEMES: Theme[] = ['dark', 'dracula', 'nord', 'tokyo-night', 'everforest'];

/** Human readable display names per theme. */
export const THEME_LABELS: Record<Theme, string> = {
	light: 'Light',
	dark: 'Dark',
	dracula: 'Dracula',
	nord: 'Nord',
	'tokyo-night': 'Tokyo Night',
	solarized: 'Solarized',
	'catppuccin-latte': 'Catppuccin Latte',
	'gruvbox-light': 'Gruvbox Light',
	everforest: 'Everforest'
};
