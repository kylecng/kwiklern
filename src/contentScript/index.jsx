import Browser from 'webextension-polyfill'
import { extractContentData } from './extractor/extractContentData'
import { devErr, devInfo, devLog } from '../utils'

devInfo(
  'CONTENTSCRIPT IS RUNNING ========================================================================================================================================================================================================================================================================================================================================================================================================',
)

Browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'CALL_SUMMARY_STREAM') {
    extractContentData(message?.data?.linkUrl)
      .then(async (contentData) => {
        const { prompt } = await sendMessageToBackground({
          action: 'GET_PROMPT',
          data: { contentData },
        })
        const port = Browser.runtime.connect()
        let text, autoTags

        let listener
        const cleanup = () => {
          listener && port?.onMessage?.removeListener(listener)
          port?.disconnect()
        }

        listener = (msg) => {
          if (msg?.data?.text) {
            ;({ text, autoTags } = msg.data)
          } else if (msg.error) {
            cleanup()
            sendResponse({ error: msg.error })
          } else if (msg.status === 'DONE') {
            cleanup()
            const summaryData = { text, autoTags }
            sendResponse({ summaryData, contentData })
          }
        }
        port.onMessage.addListener(listener)
        port.postMessage({ prompt })
      })
      .catch((err) => {
        sendResponse({ error: err })
      })
    return true
  }
})
