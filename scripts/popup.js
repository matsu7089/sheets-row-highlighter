const sendMessageToActiveTab = async (message) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })

  return chrome.tabs.sendMessage(tab.id, message)
}

window.addEventListener('load', async () => {
  const sheetKey = await sendMessageToActiveTab({ type: 'getSheetKey' }).catch(
    () => {}
  )

  const opacityInput = document.getElementById('opacity')
  const rowInput = document.getElementById('row')
  const columnInput = document.getElementById('column')
  const autoInput = document.getElementById('auto')
  const resetButton = document.getElementById('reset')

  const defaultColor = '#0e65eb'
  const defaultOpacity = '0.1'
  const defaultRow = true
  const defaultColumn = false
  const defaultAuto = false

  const hueb = new Huebee('#color', {
    notation: 'hex',
    customColors: [
      '#0e65eb',
      '#5c0eec',
      '#ec0ed6',
      '#ec0e2f',
      '#ec930e',
      '#9eec0e',
      '#0eec24',
      '#0eeccb',
    ],
    shades: 0,
    hues: 4,
  })

  // 設定リセット
  resetButton.addEventListener('click', () => {
    hueb.setColor(defaultColor)
    opacityInput.value = defaultOpacity
    rowInput.checked = defaultRow
    columnInput.checked = defaultColumn
    autoInput.checked = defaultAuto

    chrome.storage.local.set({
      color: defaultColor,
      opacity: defaultOpacity,
      row: defaultRow,
      column: defaultColumn,
      auto: defaultAuto,
      sheetSettingsMap: {},
    })
  })

  // 設定保存
  const save = () => {
    const color = hueb.color
    const opacity = Math.min(Math.max(opacityInput.value, 0.01), 0.5)
    const row = rowInput.checked
    const column = columnInput.checked
    const auto = autoInput.checked

    chrome.storage.local.get(['sheetSettingsMap'], ({ sheetSettingsMap }) => {
      sheetSettingsMap ??= {}

      if (auto && sheetKey) {
        sheetSettingsMap[sheetKey] = {
          color,
          opacity,
          row,
          column,
          lastAccess: Date.now(),
        }
      }

      const sheetSettingsLimit = 250

      if (sheetSettingsLimit < Object.keys(sheetSettingsMap).length) {
        sheetSettingsMap = Object.entries(sheetSettingsMap)
          .sort((a, b) => b[1].lastAccess - a[1].lastAccess)
          .slice(0, sheetSettingsLimit)
          .reduce((acc, cur) => {
            acc[cur[0]] = cur[1]
            return acc
          }, {})
      }

      chrome.storage.local.set({
        color,
        opacity,
        row,
        column,
        auto,
        sheetSettingsMap,
      })
    })
  }

  // 設定読み込み
  chrome.storage.local.get(
    ['color', 'opacity', 'row', 'column', 'auto', 'sheetSettingsMap'],
    (items) => {
      const { color, opacity, row, column } =
        (sheetKey && items.auto && items.sheetSettingsMap?.[sheetKey]) || items

      hueb.setColor(color ?? defaultColor)
      opacityInput.value = opacity ?? defaultOpacity
      rowInput.checked = row ?? defaultRow
      columnInput.checked = column ?? defaultColumn
      autoInput.checked = items.auto ?? defaultAuto

      // 値が変更されたときに保存
      hueb.on('change', save)
      opacityInput.addEventListener('change', save)
      rowInput.addEventListener('change', save)
      columnInput.addEventListener('change', save)
      autoInput.addEventListener('change', save)
    }
  )

  // ショートカット入力のメッセージを受け取ったとき
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type !== 'commands') return

    rowInput.checked = request.row
    columnInput.checked = request.column
  })
})
