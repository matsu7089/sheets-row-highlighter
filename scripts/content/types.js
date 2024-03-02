// @ts-check

/**
 * @typedef {Object} HighlightRect
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} ActiveCellLocator
 * @property {() => Array<HighlightRect>} getHighlightRectList
 * @property {() => Partial<CSSStyleDeclaration>} getSheetContainerStyle
 * @property {() => string} getSheetKey
 */
