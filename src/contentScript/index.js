import Browser from 'webextension-polyfill'

console.info('contentScript is running')

Browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'GET_PAGE_HTML') {
    const pageHtml = document.documentElement.outerHTML
    const pageUrl = window.location.href
    sendResponse({ pageHtml, pageUrl })
  }
})
