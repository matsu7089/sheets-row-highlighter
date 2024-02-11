// @ts-check
/// <reference path="./types.js" />

/** @implements {ActiveCellLocator} */
class SheetsActiveCellLocator {
  /** @readonly */
  _activeBorderClass = 'active-cell-border'
  /** @readonly */
  _selectionClass = 'selection'
  /** @readonly */
  _sheetContainerId = 'waffle-grid-container'

  getHighlightRectList() {
    const activeSelectionList = Array.from(
      /** @type {HTMLCollectionOf<HTMLElement>} */ (
        document.getElementsByClassName(this._selectionClass)
      )
    ).filter((element) => element.style.display !== 'none')

    if (activeSelectionList.length) {
      return this._getMultipleHighlightRectList(activeSelectionList)
    }

    return this._getSingleHighlightRectList()
  }

  /**
   * @param {Array<HTMLElement>} activeSelectionList
   * @returns {Array<HighlightRect>}
   */
  _getMultipleHighlightRectList(activeSelectionList) {
    const sheetRect = this._getSheetContainerRect()

    if (!sheetRect) {
      return []
    }

    /** @type {Array<HighlightRect>} */
    const activeSelectionRectList = activeSelectionList.map((element) => {
      const { x, y, width, height } = element.getBoundingClientRect()
      return {
        x: Math.ceil(x - sheetRect.x),
        y: Math.ceil(y - sheetRect.y),
        width: Math.ceil(width),
        height: Math.ceil(height),
      }
    })

    const rowOrColumnRectList = activeSelectionRectList.filter(
      (rect) => sheetRect.width < rect.width || sheetRect.height < rect.height
    )

    // 行か列選択と同じ位置のセルを除外して返す
    return activeSelectionRectList.filter(
      (rect) =>
        !rowOrColumnRectList.some(({ x, y, width, height }) =>
          height < width
            ? rect.y === y && rect.height === height
            : rect.x === x && rect.width === width
        )
    )
  }

  /** @returns {Array<HighlightRect>} */
  _getSingleHighlightRectList() {
    const sheetRect = this._getSheetContainerRect()
    const activeBorderList = document.getElementsByClassName(
      this._activeBorderClass
    )

    if (!sheetRect || activeBorderList.length !== 4) {
      return []
    }

    const topBorderRect = activeBorderList[0].getBoundingClientRect()
    const leftBorderRect = activeBorderList[3].getBoundingClientRect()

    return [
      {
        x: topBorderRect.x - sheetRect.x,
        y: topBorderRect.y - sheetRect.y,
        width: topBorderRect.width,
        height: leftBorderRect.height,
      },
    ]
  }

  _getSheetContainerRect() {
    return document
      .getElementById(this._sheetContainerId)
      ?.getBoundingClientRect()
  }

  getSheetContainerStyle() {
    const { x, y, width, height } = this._getSheetContainerRect() || {}

    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    }
  }
}
