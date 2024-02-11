// @ts-check
/// <reference path="./types.js" />

/** @implements {ActiveCellLocator} */
class ExcelActiveCellLocator {
  /** @readonly */
  _singleSelectionClassList = [
    'ewr-cell-selection-highlight-all-after-fluent',
    'ewr-cell-selection-highlight-all',
  ]
  /** @readonly */
  _multipleSelectionClassList = [
    'ewr-discontinuous-selection-active-range-border-after-fluent',
    'ewr-discontinuous-selection-active-range-border',
    'ewr-discontinuous-selection-after-fluent',
    'ewr-discontinuous-selection',
  ]
  /** @readonly */
  _sheetContainerClass = 'ewa-grid-ltr'
  /** @readonly */
  _hiddenClass = 'ewa-hidden'

  getHighlightRectList() {
    const sheetRect = this._getSheetContainerRect()

    if (!sheetRect) {
      return []
    }

    const singleSelectionList = this._singleSelectionClassList
      .flatMap((className) =>
        Array.from(
          /** @type {HTMLCollectionOf<HTMLElement>} */ (
            document.getElementsByClassName(className)
          )
        )
      )
      .filter((element) => !element.classList.contains(this._hiddenClass))

    const rectList = singleSelectionList.length
      ? this._getSingleHighlightRectList(singleSelectionList)
      : this._getMultipleHighlightRectList()

    // 行か列選択は除外して返す
    return rectList.filter(
      (rect) =>
        !(sheetRect.width < rect.width || sheetRect.height < rect.height)
    )
  }

  /**
   * @param {Array<HTMLElement>} singleSelectionList
   * @returns {Array<HighlightRect>}
   */
  _getSingleHighlightRectList(singleSelectionList) {
    const sheetRect = this._getSheetContainerRect()

    if (!sheetRect) {
      return []
    }

    const selectionRect = singleSelectionList
      // NOTE: 一番若いidがアクティブセルなのでソートしてから1つ目を取得
      .sort((a, b) => {
        if (a.id < b.id) {
          return -1
        }
        if (a.id > b.id) {
          return 1
        }
        return 0
      })[0]
      .getBoundingClientRect()

    return [
      {
        x: selectionRect.x - sheetRect.x,
        y: selectionRect.y - sheetRect.y,
        width: selectionRect.width,
        height: selectionRect.height,
      },
    ]
  }

  /** @returns {Array<HighlightRect>} */
  _getMultipleHighlightRectList() {
    const sheetRect = this._getSheetContainerRect()

    if (!sheetRect) {
      return []
    }

    const selectionList = this._multipleSelectionClassList
      .flatMap((className) =>
        Array.from(
          /** @type {HTMLCollectionOf<HTMLElement>} */ (
            document.getElementsByClassName(className)
          )
        )
      )
      .filter((element) => !element.classList.contains(this._hiddenClass))

    return selectionList.map((element) => {
      const { x, y, width, height } = element.getBoundingClientRect()

      return {
        x: x - sheetRect.x,
        y: y - sheetRect.y,
        width,
        height,
      }
    })
  }

  _getSheetContainerRect() {
    const sheetContainer = /** @type {HTMLElement | undefined} */ (
      document.getElementsByClassName(this._sheetContainerClass)[0]
    )

    return sheetContainer?.getBoundingClientRect()
  }

  getSheetContainerStyle() {
    const sheetContainer = /** @type {HTMLElement | undefined} */ (
      document.getElementsByClassName(this._sheetContainerClass)[0]
    )

    const { x, y, width, height } =
      sheetContainer?.getBoundingClientRect() || {}

    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      zoom: sheetContainer?.style['zoom'],
      zIndex: '1',
    }
  }
}
