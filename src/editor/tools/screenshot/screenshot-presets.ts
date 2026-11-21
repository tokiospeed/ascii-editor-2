/**
 * Data-driven screenshot preset sizes.
 *
 * Add or adjust entries here and the Screenshot tool UI picks them up
 * automatically (grouped by platform in the order defined below).
 *
 * Sources: official platform guidelines & the Sprout Social 2026 social media
 * image sizes guide (updated November 2026).
 */
export interface ScreenshotPreset {
	/** Stable identifier, also used in the downloaded file name. */
	id: string;
	/** Display label in the dropdown. */
	label: string;
	/** Crop target width in pixels. */
	width: number;
	/** Crop target height in pixels. */
	height: number;
	/** Grouping key shown as a section header in the dropdown. */
	group: string;
}

export const SCREENSHOT_PRESETS: ScreenshotPreset[] = [
	// YouTube — banner 2560x1440 (min upload 2048x1152, safe area 1235x388),
	// thumbnails are now recommended at 4K.
	{ id: 'youtube-banner', label: 'YouTube Banner', width: 2560, height: 1440, group: 'YouTube' },
	{ id: 'youtube-profile', label: 'YouTube Profile', width: 800, height: 800, group: 'YouTube' },
	{
		id: 'youtube-thumbnail',
		label: 'YouTube Thumbnail',
		width: 3840,
		height: 2160,
		group: 'YouTube'
	},
	{
		id: 'youtube-shorts-thumbnail',
		label: 'YouTube Shorts Thumbnail',
		width: 2160,
		height: 3840,
		group: 'YouTube'
	},
	{ id: 'youtube-short', label: 'YouTube Short', width: 1080, height: 1920, group: 'YouTube' },

	// Instagram — feed now favors 4:5 portrait; grid displays at 3:4.
	{
		id: 'instagram-post',
		label: 'Instagram Post (4:5)',
		width: 1080,
		height: 1350,
		group: 'Instagram'
	},
	{
		id: 'instagram-post-square',
		label: 'Instagram Post (1:1)',
		width: 1080,
		height: 1080,
		group: 'Instagram'
	},
	{
		id: 'instagram-story',
		label: 'Instagram Story / Reels',
		width: 1080,
		height: 1920,
		group: 'Instagram'
	},

	// X (Twitter)
	{ id: 'x-post', label: 'X Post', width: 1600, height: 900, group: 'X (Twitter)' },
	{ id: 'x-header', label: 'X Header', width: 1500, height: 500, group: 'X (Twitter)' },
	{ id: 'x-profile', label: 'X Profile', width: 400, height: 400, group: 'X (Twitter)' },

	// Discord
	{ id: 'discord-avatar', label: 'Discord Avatar', width: 512, height: 512, group: 'Discord' },
	{ id: 'discord-banner', label: 'Discord Banner', width: 960, height: 540, group: 'Discord' },

	// Others
	{ id: 'tiktok', label: 'TikTok', width: 1080, height: 1920, group: 'Others' },
	{ id: 'facebook-cover', label: 'Facebook Cover', width: 851, height: 315, group: 'Others' },
	{
		id: 'facebook-post',
		label: 'Facebook Post (4:5)',
		width: 1080,
		height: 1350,
		group: 'Others'
	}
];

/** Groups in the order they appear in the dropdown. */
export function getScreenshotPresetGroups(): string[] {
	return [...new Set(SCREENSHOT_PRESETS.map((preset) => preset.group))];
}
