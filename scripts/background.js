const defaultRow = true
const defaultColumn = false

chrome.commands.onCommand.addListener((command) => {
  chrome.storage.local.get(['row', 'column'], (items) => {
    let row = items.row === undefined ? defaultRow : items.row
    let column = items.column === undefined ? defaultColumn : items.column

    // 入力されたショートカットに応じて設定切り替え
    switch (command) {
      case 'toggleRow':
        row = !row
        break
      case 'toggleColumn':
        column = !column
        break
    }

    // 設定保存
    chrome.storage.local.set({
      row,
      column,
    })

    // メッセージを送信
    chrome.runtime.sendMessage({
      type: 'commands',
      row,
      column,
    })
  })
})
