const sendMessageToActiveTab = async (message) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })

  return chrome.tabs.sendMessage(tab.id, message)
}

const defaultRow = true
const defaultColumn = false

chrome.commands.onCommand.addListener(async (command) => {
  const sheetKey = await sendMessageToActiveTab({ type: 'getSheetKey' }).catch(
    () => {}
  )

  chrome.storage.local.get(
    ['color', 'opacity', 'row', 'column', 'auto', 'sheetSettingsMap'],
    (items) => {
      let row = items.row ?? defaultRow
      let column = items.column ?? defaultColumn
      let sheetSettingsMap = items.sheetSettingsMap ?? {}

      // 入力されたショートカットに応じて設定切り替え
      switch (command) {
        case 'toggleRow': {
          row = !row
          break
        }
        case 'toggleColumn': {
          column = !column
          break
        }
        case 'toggleBoth': {
          if (row || column) {
            row = false
            column = false
          } else {
            row = true
            column = true
          }
          break
        }
      }

      if (sheetKey && items.auto) {
        const { color, opacity } = sheetSettingsMap[sheetKey] || items

        sheetSettingsMap[sheetKey] = {
          color,
          opacity,
          row,
          column,
          lastAccess: Date.now(),
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
      }

      // 設定保存
      chrome.storage.local.set({
        row,
        column,
        sheetSettingsMap,
      })

      // popupにメッセージを送信
      chrome.runtime
        .sendMessage({
          type: 'commands',
          row,
          column,
        })
        .catch(() => {})
    }
  )
})
