import type { CanvasKit, Paint, PaintStyle, Canvas as WasmCanvas } from 'canvaskit-wasm';

export const ANCHOR_BASE_SIZE = 8;

export interface AnchorStyle {
	fillPaint: Paint;
	strokePaint: Paint;
}

export function drawAnchor(
	canvasKit: CanvasKit,
	skCanvas: WasmCanvas,
	cx: number,
	cy: number,
	style: AnchorStyle,
	pixelRatio: number = 1
) {
	const size = ANCHOR_BASE_SIZE * Math.max(pixelRatio / 2, 1);
	const half = size / 2;
	const rect = canvasKit.LTRBRect(cx - half, cy - half, cx + half, cy + half);
	skCanvas.drawRect(rect, style.fillPaint);
	skCanvas.drawRect(rect, style.strokePaint);
}

export function createColor(canvasKit: CanvasKit, color: Float32Array | number[]) {
	return canvasKit.Color4f(color[0], color[1], color[2], color[3]);
}

export function createPaint(
	canvasKit: CanvasKit,
	color: Float32Array | number[],
	style: PaintStyle,
	strokeWidth?: number
): Paint {
	const paint = new canvasKit.Paint();
	paint.setColor(createColor(canvasKit, color));
	paint.setStyle(style);
	paint.setAntiAlias(true);
	if (strokeWidth !== undefined) {
		paint.setStrokeWidth(strokeWidth);
	}
	return paint;
}

/**
 * Perceived luminance of a normalized (0..1) RGBA color.
 */
export function colorLuminance(color: number[] | Float32Array): number {
	return color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722;
}

/**
 * Backgrounds brighter than this are considered "light", where regular-weight
 * mono glyphs look washed out.
 */
export const LIGHT_BACKGROUND_LUMA_THRESHOLD = 0.55;

/**
 * Sub-pixel stroke used to fake-bold glyphs on light backgrounds so black
 * ASCII text reads deep and crisp instead of thin and faded.
 */
export const GLYPH_DEEPEN_STROKE_WIDTH = 0.45;

/**
 * Deepens glyph rendering for light backgrounds: switches the paint to
 * StrokeAndFill with a sub-pixel stroke (fake bold). No-op on dark themes or
 * when the runtime lacks StrokeAndFill support.
 */
export function applyGlyphDeepening(
	canvasKit: CanvasKit,
	paint: Paint,
	background: number[] | Float32Array,
	strokeScale: number = 1
): void {
	if (colorLuminance(background) <= LIGHT_BACKGROUND_LUMA_THRESHOLD) return;

	// StrokeAndFill exists at runtime but is missing from canvaskit-wasm's types.
	const styles = canvasKit.PaintStyle as unknown as Partial<{
		Fill: PaintStyle;
		Stroke: PaintStyle;
		StrokeAndFill: PaintStyle;
	}>;
	const strokeAndFill = styles.StrokeAndFill;
	if (!strokeAndFill) return;

	paint.setStyle(strokeAndFill);
	paint.setStrokeWidth(GLYPH_DEEPEN_STROKE_WIDTH * strokeScale);
}

export function drawRotationHandle(
	canvasKit: CanvasKit,
	skCanvas: WasmCanvas,
	cx: number,
	cy: number,
	style: AnchorStyle,
	pixelRatio: number = 1
) {
	const size = ANCHOR_BASE_SIZE * Math.max(pixelRatio / 2, 1);
	const half = size / 2;
	const oval = canvasKit.LTRBRect(cx - half, cy - half, cx + half, cy + half);
	skCanvas.drawOval(oval, style.fillPaint);
	skCanvas.drawOval(oval, style.strokePaint);
}

export function createFillPaint(canvasKit: CanvasKit, color: Float32Array | number[]): Paint {
	return createPaint(canvasKit, color, canvasKit.PaintStyle.Fill);
}

export function createStrokePaint(
	canvasKit: CanvasKit,
	color: Float32Array | number[],
	width: number = 1
): Paint {
	return createPaint(canvasKit, color, canvasKit.PaintStyle.Stroke, width);
}
