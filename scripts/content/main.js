// @ts-check
/// <reference path="./SheetsActiveCellLocator.js" />
/// <reference path="./ExcelActiveCellLocator.js" />
/// <reference path="./RowHighlighterApp.js" />

const appContainer = document.createElement('div')
appContainer.id = 'rh-app-container'
document.body.appendChild(appContainer)

const locator =
  location.host === 'docs.google.com'
    ? new SheetsActiveCellLocator()
    : new ExcelActiveCellLocator()

const app = new RowHighlighterApp(appContainer, locator)
const updateHighlight = app.update.bind(app)

window.addEventListener('click', updateHighlight)
window.addEventListener('keydown', updateHighlight)
window.addEventListener('keyup', updateHighlight)
window.addEventListener('resize', updateHighlight)
window.addEventListener('scroll', updateHighlight, true)

// @ts-ignore chrome.xxxの参照エラーを無視
const storage = chrome.storage
const sheetKey = locator.getSheetKey()

const loadSettings = () => {
  storage.local.get(
    ['color', 'opacity', 'row', 'column', 'auto', 'sheetSettingsMap'],
    (/** @type {any} */ items) => {
      const { color, opacity, row, column } =
        (items.auto && items.sheetSettingsMap?.[sheetKey]) || items

      app.backgroundColor = color ?? app.backgroundColor
      app.opacity = opacity ?? app.opacity
      app.isRowEnabled = row ?? app.isRowEnabled
      app.isColEnabled = column ?? app.isColEnabled
      updateHighlight()
    }
  )
}
loadSettings()

storage.local.get(['sheetSettingsMap'], ({ sheetSettingsMap }) => {
  if (sheetSettingsMap?.[sheetKey]) {
    sheetSettingsMap[sheetKey].lastAccess = Date.now()
    storage.local.set({ sheetSettingsMap })
  }

  // 設定変更時に再読み込み
  storage.onChanged.addListener(loadSettings)
})

// popupからのgetSheetKey応答処理
// @ts-ignore chrome.xxxの参照エラーを無視
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'getSheetKey') {
    return
  }

  sendResponse(sheetKey)
})
