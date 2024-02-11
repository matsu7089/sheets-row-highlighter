// @ts-check
/// <reference path="./types.js" />

class RowHighlighterApp {
  /**
   * @param {HTMLElement} appContainer
   * @param {ActiveCellLocator} locator
   */
  constructor(appContainer, locator) {
    this.appContainer = appContainer
    this.locator = locator

    /** @type {Array<HTMLElement>} */
    this.elementPool = []

    this.backgroundColor = '#0e65eb'
    this.opacity = '0.1'
    this.isRowEnabled = true
    this.isColEnabled = false
  }

  update() {
    const rectList = this.locator.getHighlightRectList()

    Object.assign(this.appContainer.style, {
      position: 'absolute',
      pointerEvents: 'none',
      overflow: 'hidden',
      ...this.locator.getSheetContainerStyle(),
    })

    const highlightTaskList = (
      this.isRowEnabled
        ? this._mergeRectList(rectList, 'y').map(({ height, y }) => ({
            left: '0px',
            top: `${y}px`,
            width: '100%',
            height: `${height}px`,
          }))
        : []
    ).concat(
      this.isColEnabled
        ? this._mergeRectList(rectList, 'x').map(({ width, x }) => ({
            left: `${x}px`,
            top: '0px',
            width: `${width}px`,
            height: '100%',
          }))
        : []
    )

    const diff = highlightTaskList.length - this.elementPool.length

    if (0 < diff) {
      Array.from({ length: diff }).forEach(() => {
        const element = document.createElement('div')
        this.elementPool.push(element)
        this.appContainer.appendChild(element)
      })
    }

    if (diff < 0) {
      this.elementPool.slice(diff).forEach((element) => {
        element.style.display = 'none'
      })
    }

    highlightTaskList.forEach((task, index) => {
      const element = this.elementPool[index]

      Object.assign(element.style, {
        position: 'absolute',
        pointerEvents: 'none',
        display: 'block',
        backgroundColor: this.backgroundColor,
        opacity: this.opacity,
        ...task,
      })
    })
  }

  /**
   * 範囲が重なるRectをマージして新しいリストを返す
   * @param {Array<HighlightRect>} rectList
   * @param {'x' | 'y'} dim
   * @returns {Array<HighlightRect>}
   */
  _mergeRectList(rectList, dim) {
    return [...rectList]
      .sort((a, b) => a[dim] - b[dim])
      .reduce((acc, rect) => {
        const prevRect = acc[acc.length - 1]
        const dimSize = dim === 'x' ? 'width' : 'height'

        if (!prevRect || prevRect[dim] + prevRect[dimSize] < rect[dim]) {
          acc.push({ ...rect })
          return acc
        }

        prevRect[dimSize] = Math.max(
          prevRect[dimSize],
          rect[dim] + rect[dimSize] - prevRect[dim]
        )

        return acc
      }, /** @type {Array<HighlightRect>} */ ([]))
  }
}
