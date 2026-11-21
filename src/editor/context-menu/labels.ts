export const LabelKey = {
	ClipboardCut: 'menu.clipboard.cut',
	ClipboardCopy: 'menu.clipboard.copy',
	ClipboardPaste: 'menu.clipboard.paste',
	ClipboardDuplicate: 'menu.clipboard.duplicate',

	ArrangeBringToFront: 'menu.arrange.bring-to-front',
	ArrangeBringForward: 'menu.arrange.bring-forward',
	ArrangeSendBackward: 'menu.arrange.send-backward',
	ArrangeSendToBack: 'menu.arrange.send-to-back',

	SelectAll: 'menu.select.all',
	SelectionDelete: 'menu.selection.delete',
	SelectDeselect: 'menu.select.deselect',
	SelectInverse: 'menu.select.inverse',

	ObjectCommit: 'menu.object.commit',
	ObjectCancel: 'menu.object.cancel',

	TransformRotate: 'menu.transform.rotate',
	TransformRotate90: 'menu.transform.rotate.90',
	TransformRotateNeg90: 'menu.transform.rotate.-90',
	TransformRotate180: 'menu.transform.rotate.180',
	TransformFlipHorizontal: 'menu.transform.flip.horizontal',
	TransformFlipVertical: 'menu.transform.flip.vertical',

	ViewToggleUI: 'menu.view.toggle-ui',
	ViewShowUI: 'menu.view.show-ui',
	ViewHideUI: 'menu.view.hide-ui',
	ViewToggleGrid: 'menu.view.toggle-grid',
	ViewShowGrid: 'menu.view.show-grid',
	ViewHideGrid: 'menu.view.hide-grid',
	ViewTheme: 'menu.view.theme',
	ViewThemeLight: 'menu.view.theme.light',
	ViewThemeDark: 'menu.view.theme.dark',
	ViewThemeDracula: 'menu.view.theme.dracula',
	ViewThemeNord: 'menu.view.theme.nord',
	ViewThemeTokyoNight: 'menu.view.theme.tokyo-night',
	ViewThemeSolarized: 'menu.view.theme.solarized',
	ViewThemeCatppuccinLatte: 'menu.view.theme.catppuccin-latte',
	ViewThemeGruvboxLight: 'menu.view.theme.gruvbox-light',
	ViewThemeEverforest: 'menu.view.theme.everforest',

	LayerRasterize: 'menu.layer.rasterize'
} as const;
export type LabelKeyType = (typeof LabelKey)[keyof typeof LabelKey];
