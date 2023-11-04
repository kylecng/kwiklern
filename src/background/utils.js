import Browser from 'webextension-polyfill'

export async function sendMessageToContentScript(tabId, message, timeout) {
  const messagePromise = new Promise((resolve) => {
    Browser.tabs
      .sendMessage(tabId, message)
      .then((response) => {
        console.log('request', message, '\nresponse', response)
        resolve(response)
      })
      .catch((error) => {
        // Handle any errors here
        console.error('Error:', error)
        resolve(null) // Resolve the promise with null or an appropriate value
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
