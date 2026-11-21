<script lang="ts">
	import { useTheme } from '@/theme/useTheme';
	import { THEMES, THEME_LABELS } from '@/theme/constants';
	import type { Theme } from '@/theme/types';
	import Button from '@components/button/button.svelte';

	import * as Tooltip from '@components/tooltip';
	import ThemeIcon from '@/theme/ThemeIcon.svelte';
	const { theme, cycleTheme } = useTheme();

	/** Icon shown on the button for each active theme. */
	const THEME_ICONS: Record<Theme, string> = {
		light: 'sun',
		dark: 'moon',
		dracula: 'coffin',
		nord: 'snowflake',
		'tokyo-night': 'torii',
		solarized: 'sunrise',
		'catppuccin-latte': 'cat',
		'gruvbox-light': 'vinyl'
	};

	function nextTheme(): Theme {
		const index = THEMES.indexOf($theme);
		return THEMES[(index + 1) % THEMES.length] ?? 'light';
	}
</script>

<Tooltip.Root>
	<Tooltip.Trigger asChild let:builder>
		<div class="flex">
			<Button builders={[builder]} on:click={cycleTheme} size="icon-sm" variant="ghost">
				<ThemeIcon size={16} name={THEME_ICONS[$theme]} />
			</Button>
		</div>
	</Tooltip.Trigger>
	<Tooltip.Content>Next: {THEME_LABELS[nextTheme()]}</Tooltip.Content>
</Tooltip.Root>
