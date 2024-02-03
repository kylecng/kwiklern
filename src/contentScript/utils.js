import Browser from 'webextension-polyfill'
import { devErr, devLog } from '../utils'

export async function sendMessageToBackground(message, timeout) {
  const messagePromise = (async () => {
    try {
      const response = await Browser.runtime.sendMessage(message)
      if (response?.error) throw response.error
      devLog('Request:', message, '\nResponse:', response)
      return response
    } catch (error) {
      devErr('Request:', message, 'Error:', error)
      throw error
    }
  })()

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

export function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector))
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}
