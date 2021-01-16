window.addEventListener('load', () => {
  const opacityInput = document.getElementById('opacity')
  const rowInput = document.getElementById('row')
  const columnInput = document.getElementById('column')
  const resetButton = document.getElementById('reset')

  const defaultColor = '#0e65eb'
  const defaultOpacity = '0.1'
  const defaultRow = true
  const defaultColumn = false

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

    chrome.storage.local.set({
      color: defaultColor,
      opacity: defaultOpacity,
      row: defaultRow,
      column: defaultColumn,
    })
  })

  // 設定保存
  const save = () => {
    const color = hueb.color
    const opacity = Math.min(Math.max(opacityInput.value, 0.01), 0.5)
    const row = rowInput.checked
    const column = columnInput.checked

    chrome.storage.local.set({
      color,
      opacity,
      row,
      column,
    })
  }

  // 設定読み込み
  chrome.storage.local.get(['color', 'opacity', 'row', 'column'], (items) => {
    hueb.setColor(items.color || defaultColor)
    opacityInput.value = items.opacity || defaultOpacity

    rowInput.checked = items.row === undefined ? defaultRow : items.row
    columnInput.checked = items.column === undefined ? defaultColumn : items.column

    // 値が変更されたときに保存
    hueb.on('change', save)
    opacityInput.addEventListener('change', save)
    rowInput.addEventListener('change', save)
    columnInput.addEventListener('change', save)
  })

  // ショートカット入力のメッセージを受け取ったとき
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type !== 'commands') return

    rowInput.checked = request.row
    columnInput.checked = request.column
  })
})
