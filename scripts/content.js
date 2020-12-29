const activeBorderClass = 'active-cell-border'
const columnHeaderClass = 'column-headers-background'

const defaultColor = '#0e65eb'
const defaultOpacity = '0.1'

/**
 * ハイライト要素
 * @type {HTMLDivElement}
 */
const highlightElm = document.createElement('div')

/**
 * アクティブセルのボーダー要素
 * @type {HTMLCollectionOf<HTMLElement>}
 */
let activeBorderList = null

/** 行ヘッダーのbottom位置 */
let headerBottom = 0

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
    highlightElm.style[key] = value
  }

  // 設定読み込み
  const loadSettings = () => {
    chrome.storage.local.get(['color', 'opacity'], (items) => {
      highlightElm.style.backgroundColor = items.color || defaultColor
      highlightElm.style.opacity = items.opacity || defaultOpacity
    })
  }
  loadSettings()

  // 設定変更時に再読み込み
  chrome.storage.onChanged.addListener(loadSettings)

  // bodyにハイライト要素追加
  document.body.appendChild(highlightElm)

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
}

/**
 * ハイライト実行
 */
const doHighlight = () => {
  let topBorder = activeBorderList[0]

  // アクティブシートの変更対応
  if (topBorder.offsetParent === null) {
    const list = document.getElementsByClassName(activeBorderClass)
    activeBorderList = list.length === 4 ? list : activeBorderList

    topBorder = activeBorderList[0]
    if (topBorder.offsetParent === null) {
      highlightElm.style.display = 'none'
      return
    }
  }

  const topBorderRect = topBorder.getBoundingClientRect()
  const bottomBorderRect = activeBorderList[1].getBoundingClientRect()

  // アクティブセルのbottom位置がヘッダーより上の場合はハイライト非表示
  if (bottomBorderRect.bottom <= headerBottom) {
    highlightElm.style.display = 'none'
    return
  }

  // ハイライトtop位置計算（結合セル対応）
  const top = topBorderRect.bottom < headerBottom ? headerBottom : topBorderRect.top

  // ハイライト要素にスタイル適用
  highlightElm.style.top = top + 'px'
  highlightElm.style.height = bottomBorderRect.bottom - top + 'px'
  highlightElm.style.display = 'block'
}

/**
 * シートの要素が取得できるまで待機
 */
const waitLoadSheet = () => {
  const header = document.getElementsByClassName(columnHeaderClass)
  activeBorderList = document.getElementsByClassName(activeBorderClass)

  if (header.length === 1 && activeBorderList.length === 4) {
    headerBottom = header[0].getBoundingClientRect().bottom

    onSheetLoaded()
    doHighlight()
  } else {
    setTimeout(waitLoadSheet, 100)
  }
}
window.addEventListener('load', waitLoadSheet)
