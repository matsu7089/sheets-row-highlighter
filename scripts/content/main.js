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

const loadSettings = () => {
  // @ts-ignore chrome.xxxの参照エラーを無視
  chrome.storage.local.get(
    ['color', 'opacity', 'row', 'column'],
    (/** @type {any} */ items) => {
      app.backgroundColor = items.color || app.backgroundColor
      app.opacity = items.opacity || app.opacity
      app.isRowEnabled = items.row ?? app.isRowEnabled
      app.isColEnabled = items.column ?? app.isColEnabled
      updateHighlight()
    }
  )
}
loadSettings()

// 設定変更時に再読み込み
// @ts-ignore chrome.xxxの参照エラーを無視
chrome.storage.onChanged.addListener(loadSettings)
