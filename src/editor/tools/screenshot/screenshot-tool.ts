import type { CanvasKit, Surface } from 'canvaskit-wasm';
import { BaseTool } from '@editor/tool';
import type { CoreApi } from '@editor/core';
import { downloadBlob } from '@api/file-io';
import { applyGlyphDeepening } from '@editor/utils/rendering';
import { SCREENSHOT_PRESETS, type ScreenshotPreset } from './screenshot-presets';

/** Maximum number of cells the auto-cropped grid may span (safety guard). */
const MAX_GRID_CELLS = 4_000_000;

type AutoCroppedGrid = {
	/** One string per character-cell row, cropped to the content bounding box. */
	lines: string[];
	width: number;
	height: number;
};

/**
 * Captures the visible layer content as an image.
 *
 * The content bounding box is computed automatically (auto crop), then the
 * ASCII grid is re-rendered with the editor font into an offscreen surface
 * sized to the chosen preset (e.g. YouTube banner) and downloaded as PNG.
 */
export class ScreenshotTool extends BaseTool {
	readonly name = 'screenshot';

	constructor(coreApi: CoreApi) {
		super({
			hotkey: '<A-c>',
			coreApi,
			name: 'screenshot',
			isVisible: true,
			config: {}
		});
	}

	/**
	 * Renders and downloads a screenshot of the whole content fitted into the
	 * given preset size.
	 */
	public capture(preset: ScreenshotPreset): void {
		const grid = this.buildAutoCroppedGrid();

		if (!grid) {
			this.emitToolFeedback(
				'screenshot.empty',
				'Nothing to capture — the canvas is empty',
				'warning'
			);
			return;
		}

		try {
			const bytes = this.renderToPng(grid, preset);
			const blob = new Blob([bytes], { type: 'image/png' });
			downloadBlob(blob, `screenshot-${preset.id}-${Date.now()}.png`);
			this.emitToolFeedback(
				'screenshot.success',
				`Screenshot ${preset.width}x${preset.height} downloaded`,
				'success'
			);
		} catch (e) {
			console.error('Screenshot failed', e);
			this.emitToolFeedback('screenshot.error', 'Failed to render screenshot', 'error');
		}
	}

	/**
	 * Collects the ASCII content of every visible layer (objects + layer grid),
	 * computes the bounding box of all non-space cells and returns the cropped
	 * grid. Layer order follows the visible layer stack (top layer wins).
	 */
	private buildAutoCroppedGrid(): AutoCroppedGrid | null {
		const layersManager = this.coreApi.getLayersManager();
		const visibleLayers = layersManager.getAllVisibleLayersSorted();

		type LayerContent = {
			/** Cell -> character lookup for objects (sparse). */
			objects: Map<string, string>;
			grid: { getChar: (x: number, y: number) => string } | null;
		};

		this.bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

		const layers: LayerContent[] = [];

		for (const layer of visibleLayers) {
			const objectCells = new Map<string, string>();

			for (const obj of layer.getObjects()) {
				const tx = Math.round(obj.getProperty('transform.x'));
				const ty = Math.round(obj.getProperty('transform.y'));
				const str = obj.toString ? obj.toString() : null;
				if (!str || !str.trim()) continue;

				const lines = str.split('\n');
				for (let row = 0; row < lines.length; row++) {
					const line = lines[row];
					for (let col = 0; col < line.length; col++) {
						const ch = line[col];
						if (!ch || ch === ' ') continue;
						const key = `${tx + col},${ty + row}`;
						if (!objectCells.has(key)) objectCells.set(key, ch);
						this.expandBounds(tx + col, ty + row);
					}
				}
			}

			const grid = layer.grid;
			if (grid) {
				for (const tile of grid.queryAllTiles()) {
					if (tile.isEmpty()) continue;
					const baseX = tile.x * tile.tileSize;
					const baseY = tile.y * tile.tileSize;
					for (let row = 0; row < tile.tileSize; row++) {
						for (let col = 0; col < tile.tileSize; col++) {
							if (tile.data[row * tile.tileSize + col] !== ' ') {
								this.expandBounds(baseX + col, baseY + row);
							}
						}
					}
				}
			}

			layers.push({ objects: objectCells, grid: grid ?? null });
		}

		const { minX, minY, maxX, maxY } = this.bounds;
		if (minX === Infinity || minY === Infinity) return null;

		const width = maxX - minX + 1;
		const height = maxY - minY + 1;

		if (width * height > MAX_GRID_CELLS) {
			this.emitToolFeedback(
				'screenshot.too-large',
				'Content is too spread out to capture',
				'warning'
			);
			return null;
		}

		const lines: string[] = [];
		for (let y = minY; y <= maxY; y++) {
			let line = '';
			for (let x = minX; x <= maxX; x++) {
				let char = ' ';
				for (const layer of layers) {
					const objectChar = layer.objects.get(`${x},${y}`);
					if (objectChar) {
						char = objectChar;
						break;
					}
					const gridChar = layer.grid?.getChar(x, y);
					if (gridChar && gridChar.trim() !== '') {
						char = gridChar;
						break;
					}
				}
				line += char;
			}
			lines.push(line);
		}

		return { lines, width, height };
	}

	private bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

	private expandBounds(x: number, y: number): void {
		this.bounds.minX = Math.min(this.bounds.minX, x);
		this.bounds.minY = Math.min(this.bounds.minY, y);
		this.bounds.maxX = Math.max(this.bounds.maxX, x);
		this.bounds.maxY = Math.max(this.bounds.maxY, y);
	}

	/**
	 * Renders the cropped ASCII grid into an offscreen CanvasKit surface of the
	 * preset size (contain fit, centered on the theme background) and encodes
	 * it to PNG bytes.
	 */
	private renderToPng(grid: AutoCroppedGrid, preset: ScreenshotPreset): Uint8Array {
		const canvasKit: CanvasKit = this.coreApi.getCanvases().ascii.canvasKit;
		const fontManager = this.coreApi.getFontManager();
		const theme = this.coreApi.getConfig().getTheme();

		const metrics = fontManager.getMetrics();
		const charWidth = metrics.dimensions.width;
		const charHeight = metrics.dimensions.height;

		const contentWidth = grid.width * charWidth;
		const contentHeight = grid.height * charHeight;
		const scale = Math.min(preset.width / contentWidth, preset.height / contentHeight);
		const offsetX = (preset.width - contentWidth * scale) / 2;
		const offsetY = (preset.height - contentHeight * scale) / 2;

		const surface: Surface | null = canvasKit.MakeSurface(preset.width, preset.height);
		if (!surface) {
			throw new Error('Could not create offscreen surface');
		}

		try {
			const canvas = surface.getCanvas();

			const backgroundPaint = new canvasKit.Paint();
			backgroundPaint.setColor(
				canvasKit.Color4f(theme.background[0], theme.background[1], theme.background[2], 1)
			);
			canvas.drawPaint(backgroundPaint);
			backgroundPaint.delete();

			const fontConfig = fontManager.getCurrentFont().getConfig();
			const typeface = fontManager.getFontMgr().matchFamilyStyle(fontConfig.family, {});
			const font = new canvasKit.Font(typeface, metrics.size * scale);
			const paint = new canvasKit.Paint();
			paint.setColor(
				canvasKit.Color4f(theme.foreground[0], theme.foreground[1], theme.foreground[2], 1)
			);
			paint.setAntiAlias(false);
			// Match the editor's glyph deepening on light backgrounds (scaled to pixels).
			applyGlyphDeepening(canvasKit, paint, theme.background, scale);

			const baseline = -font.getMetrics().ascent;

			for (let row = 0; row < grid.lines.length; row++) {
				const line = grid.lines[row];
				for (let col = 0; col < line.length; col++) {
					const ch = line[col];
					if (!ch || ch === ' ') continue;
					const x = offsetX + col * charWidth * scale;
					const y = offsetY + row * charHeight * scale + baseline;
					canvas.drawText(ch, x, y, paint, font);
				}
			}

			const image = surface.makeImageSnapshot();
			if (!image) {
				throw new Error('Could not snapshot offscreen surface');
			}
			const bytes = image.encodeToBytes();
			image.delete();
			paint.delete();
			font.delete();
			if (!bytes) {
				throw new Error('Could not encode screenshot to PNG');
			}
			return bytes;
		} finally {
			surface.delete();
		}
	}
}
