import Browser from 'webextension-polyfill'

export async function sendMessageToContentScript(tabId, message, timeout) {
  const messagePromise = new Promise((resolve) => {
    Browser.tabs.sendMessage(tabId, message, (response) => {
      console.log('request', message, '\nresponse', response)
      resolve(response)
    })
  })

  if (timeout) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Message timeout of ${timeout} ms: ${JSON.stringify(message)}`))
      }, timeout)
    })
    return Promise.race([messagePromise, timeoutPromise])
  }
  return messagePromise
}

export async function getPageFromUrl(linkUrl) {
  const res = await fetch(linkUrl)
  const pageHtml = await res.text()
  const pageUrl = res.url
  return { pageHtml, pageUrl }
}
