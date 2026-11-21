<script lang="ts">
	import { Button } from '@components/button';
	import * as DropdownMenu from '@components/dropdown-menu';
	import * as Tooltip from '@components/tooltip';
	import ThemeIcon from '@/theme/ThemeIcon.svelte';
	import { useCore } from '@/config/useCore';
	import ToolTooltip from '../Tool-Tooltip.svelte';
	import type { ScreenshotTool } from '@editor/tools/screenshot/screenshot-tool';
	import {
		SCREENSHOT_PRESETS,
		getScreenshotPresetGroups,
		type ScreenshotPreset
	} from '@editor/tools/screenshot/screenshot-presets';

	const core = useCore();

	const groups = getScreenshotPresetGroups();

	function capture(preset: ScreenshotPreset) {
		const tool = core.getToolManager().getTool('screenshot') as ScreenshotTool | undefined;
		tool?.capture(preset);
	}
</script>

<DropdownMenu.Root>
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<div class="flex" use:builder.action>
				<DropdownMenu.Trigger asChild let:builder>
					<Button
						class="cursor-default"
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label="Take a screenshot"
						builders={[builder]}
					>
						<ThemeIcon name="camera" size={16} />
					</Button>
				</DropdownMenu.Trigger>
			</div>
		</Tooltip.Trigger>
		<ToolTooltip name="Screenshot" hotkey="Alt+C" hint="Auto crop & pick a banner/profile size" />
	</Tooltip.Root>

	<DropdownMenu.Content class="max-h-[22rem] w-64 overflow-y-auto" align="start">
		{#each groups as group, index (group)}
			{#if index > 0}
				<DropdownMenu.Separator />
			{/if}
			<DropdownMenu.Label class="text-xs opacity-50">{group}</DropdownMenu.Label>
			{#each SCREENSHOT_PRESETS.filter((preset) => preset.group === group) as preset (preset.id)}
				<DropdownMenu.Item on:click={() => capture(preset)}>
					{preset.label}
					<DropdownMenu.Shortcut>{preset.width}×{preset.height}</DropdownMenu.Shortcut>
				</DropdownMenu.Item>
			{/each}
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
