const isScrapbox = url => new URL(url).hostname === 'scrapbox.io'
const getPath = url => new URL(url).pathname.slice(1)
const codeURL = path => `https://scrapbox.io/api/code/${path}/tabs.list`
const codeblock = list => `code:tabs.list\n${list.map(e => '  ' + e).join('\n')}`
const encodeURL = (strings, ...values) => 
  strings.reduce((res, str, i) => res + encodeURIComponent(values[i - 1]) + str)
const newPage = (name, title, body) => 
  encodeURL`https://scrapbox.io/${name}/${title}?body=${body}`

chrome.browserAction.onClicked.addListener(tab => {
  if (isScrapbox(tab.url)) {
    fetch(codeURL(getPath(tab.url))).then(res => res.text()).then(list => {
      const url = list.split('\n').map(e => e.trim())
      chrome.windows.create({ url })
    })
  } else {
    const windowId = tab.windowId
    chrome.tabs.query({ windowId }, tabs => {
      const urls = tabs.map(tab => tab.url)
      const name = prompt('Enter your Scrapbox URL.')
      const title = new Date().toLocaleString()
      const url = newPage(name, title, codeblock(urls))
      chrome.windows.create({ url }, () => {
        chrome.windows.remove(windowId)
      })
    })
  }
})
