import Browser from 'webextension-polyfill'
import { extractFromHtml } from '@extractus/article-extractor'
import { getVideoContent } from './youtube-transcript'
import { getPrompt } from '../utils/utils'

console.info(
  'CONTENTSCRIPT IS RUNNING ========================================================================================================================================================================================================================================================================================================================================================================================================',
)

Browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'GET_PAGE_HTML') {
    const pageHtml = document.documentElement.outerHTML
    const pageUrl = window.location.href
    const page = { pageHtml, pageUrl }
    sendResponse(page)
  } else if (message.action === 'EXTRACT_ARTICLE_DATA') {
    extractFromHtml(message.data.pageHtml).then((extractedData) => {
      sendResponse(extractedData)
    })
  } else if (message.action === 'EXTRACT_VIDEO_DATA') {
    getVideoContent(message.data.pageHtml).then((extractedData) => {
      sendResponse(extractedData)
    })
  } else if (message.action === 'CALL_SUMMARY') {
    const prompt = getPrompt(message.data.content)
    console.log('prompt', prompt)
    const port = Browser.runtime.connect()
    console.log('port', port)
    const listener = (msg) => {
      if (msg.text) {
        let text = msg.text || ''
        text = text.replace(/^(\s|:\n\n)+|(:)+|(:\s)$/g, '')
        console.log(text)
      } else if (msg.error) {
        console.error(msg.error)
        port.onMessage.removeListener(listener)
        port.disconnect()
      } else if (msg.event === 'DONE') {
        console.log('done')
        port.onMessage.removeListener(listener)
        port.disconnect()
      }
    }
    port.onMessage.addListener(listener)
    port.postMessage({ question: prompt })
  }
  return true
})
