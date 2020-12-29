window.addEventListener('load', () => {
  const opacityInput = document.getElementById('opacity')
  const resetButton = document.getElementById('reset')

  const defaultColor = '#0e65eb'
  const defaultOpacity = '0.1'

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

    chrome.storage.local.set({
      color: defaultColor,
      opacity: defaultOpacity,
    })
  })

  // 設定保存
  const save = () => {
    const color = hueb.color
    const opacity = Math.min(Math.max(opacityInput.value, 0.01), 0.5)

    chrome.storage.local.set({
      color,
      opacity,
    })
  }

  // 設定読み込み
  chrome.storage.local.get(['color', 'opacity'], (items) => {
    hueb.setColor(items.color || defaultColor)
    opacityInput.value = items.opacity || defaultOpacity

    // 値が変更されたときに保存
    hueb.on('change', save)
    opacityInput.addEventListener('change', save)
  })
})
