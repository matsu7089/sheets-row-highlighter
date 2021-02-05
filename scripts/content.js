const activeBorderClass = 'active-cell-border'
const colHeaderClass = 'column-headers-background'
const menubarId = 'docs-menubars'
const gridContainerId = 'waffle-grid-container'

const defaultColor = '#0e65eb'
const defaultOpacity = '0.1'
const defaultRow = true
const defaultColumn = false

/**
 * ハイライト要素
 * @type {HTMLDivElement}
 */
const rowElm = document.createElement('div')
const colElm = document.createElement('div')

/**
 * アクティブセルのボーダー要素
 * @type {HTMLCollectionOf<HTMLElement>}
 */
let activeBorderList = null

/** 列ヘッダーのbottom位置 */
let colHeaderBottom = 0

/**
 * スプレッドシートのコンテナ要素
 * @type {HTMLDivElement}
 */
let gridContainer = null

/** 各ハイライトが有効かどうか */
let enableRow = defaultRow
let enableColumn = defaultColumn

/**
 * シート読み込み完了時
 */
const onSheetLoaded = () => {
  // ハイライト要素にスタイル適用
  const styles = {
    position: 'absolute',
    left: '0px',
    width: '100%',
    pointerEvents: 'none',
  }
  for (const [key, value] of Object.entries(styles)) {
    rowElm.style[key] = value
    colElm.style[key] = value
  }

  // bodyにハイライト要素追加
  const container = document.createElement('div')
  container.appendChild(rowElm)
  container.appendChild(colElm)
  document.body.appendChild(container)

  // イベント登録
  window.addEventListener('click', doHighlight)
  window.addEventListener('keydown', doHighlight)
  window.addEventListener('keyup', doHighlight)
  window.addEventListener(
    'scroll',
    () => {
      // 位置ズレの暫定対応
      setTimeout(doHighlight)
    },
    true
  )

  // メニューバーの表示切り替え対応
  const menubar = document.getElementById(menubarId)
  const observer = new MutationObserver(() => {
    // 位置ズレの暫定対応
    setTimeout(() => {
      onResize()
      doHighlight()
    })
  })
  observer.observe(menubar, {
    attriblutes: true,
    attributeFilter: ['style'],
  })

  // 設定読み込み
  const loadSettings = () => {
    const rowStyle = rowElm.style
    const colStyle = colElm.style

    chrome.storage.local.get(['color', 'opacity', 'row', 'column'], (items) => {
      rowStyle.backgroundColor = items.color || defaultColor
      rowStyle.opacity = items.opacity || defaultOpacity

      colStyle.backgroundColor = items.color || defaultColor
      colStyle.opacity = items.opacity || defaultOpacity

      enableRow = items.row === undefined ? defaultRow : items.row
      enableColumn = items.column === undefined ? defaultColumn : items.column

      doHighlight()
    })
  }
  loadSettings()

  // 設定変更時に再読み込み
  chrome.storage.onChanged.addListener(loadSettings)
}

/**
 * ハイライト実行
 */
const doHighlight = () => {
  const rowStyle = rowElm.style
  const colStyle = colElm.style

  let topBorder = activeBorderList[0]

  // アクティブシートの変更対応
  if (topBorder.offsetParent === null) {
    const list = document.getElementsByClassName(activeBorderClass)
    activeBorderList = list.length === 4 ? list : activeBorderList

    topBorder = activeBorderList[0]
    if (topBorder.offsetParent === null) {
      rowStyle.display = 'none'
      colStyle.display = 'none'
      return
    }
  }

  const topBorderRect = topBorder.getBoundingClientRect()
  const bottomBorderRect = activeBorderList[1].getBoundingClientRect()
  const gridRect = gridContainer.getBoundingClientRect()

  // アクティブセルのbottom位置がヘッダーより上か
  // top位置がスプレッドシートのグリッドより下の場合はハイライト非表示
  if (bottomBorderRect.bottom <= colHeaderBottom || gridRect.bottom <= topBorderRect.top) {
    rowStyle.display = 'none'
    colStyle.display = 'none'
    return
  }

  // 行ハイライトtop位置計算（結合セル対応）
  const top = topBorderRect.bottom < colHeaderBottom ? colHeaderBottom : topBorderRect.top

  // 行ハイライト要素にスタイル適用
  rowStyle.top = top + 'px'
  rowStyle.height = bottomBorderRect.bottom - top + 'px'
  rowStyle.display = enableRow ? 'block' : 'none'

  // 列ハイライト要素にスタイル適用
  colStyle.top = gridRect.top + 'px'
  colStyle.left = topBorderRect.left + 'px'
  colStyle.height = gridRect.height + 'px'
  colStyle.width = topBorderRect.width + 'px'
  colStyle.display = enableColumn ? 'block' : 'none'
}

/**
 * エディターのリサイズ時
 */
const onResize = () => {
  // colHeaderBottomを再取得
  const colHeader = document.getElementsByClassName(colHeaderClass)
  if (colHeader.length === 0) return
  colHeaderBottom = colHeader[0].getBoundingClientRect().bottom
}

/**
 * シートの要素が取得できるまで待機
 */
const waitLoadSheet = () => {
  const menubar = document.getElementById(menubarId)
  gridContainer = document.getElementById(gridContainerId)
  const colHeader = document.getElementsByClassName(colHeaderClass)
  activeBorderList = document.getElementsByClassName(activeBorderClass)

  if (
    menubar !== null &&
    gridContainer !== null &&
    colHeader.length === 1 &&
    activeBorderList.length === 4
  ) {
    colHeaderBottom = colHeader[0].getBoundingClientRect().bottom

    onSheetLoaded()
  } else {
    setTimeout(waitLoadSheet, 100)
  }
}
window.addEventListener('load', waitLoadSheet)
