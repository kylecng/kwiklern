import Browser from 'webextension-polyfill'
import { sendMessageToBackground, waitForElm } from './utils'
import { createRoot } from 'react-dom/client'
import { extractContentData } from './extractor/extractContentData'
import YoutubeVideo from './components/inject/YoutubeVideo'
import YoutubePlaylist from './components/inject/YoutubePlaylist'
import { devErr, devInfo, trySilent } from '../utils'

const runtimeListener = function (message, sender, sendResponse) {
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
}

function main() {
  devInfo(
    'CONTENTSCRIPT IS RUNNING ========================================================================================================================================================================================================================================================================================================================================================================================================',
  )
  Browser.runtime.onMessage.addListener(runtimeListener)

  const injectCustomComponents = async () => {
    try {
      const pageUrl = window.location.href
      if (pageUrl.includes('youtube.com/watch?v=')) {
        const sideSelector = '#secondary.style-scope.ytd-watch-flexy'
        const customId = 'kwiklern-root'
        await waitForElm(sideSelector)
        const sideElement = document.querySelector(sideSelector)
        const myElement = document.createElement('div')
        myElement.id = customId
        myElement.style.width = '100%'
        sideElement.insertBefore(myElement, sideElement.firstChild)
        createRoot(document.getElementById(customId)).render(<YoutubeVideo url={pageUrl} />)
      } else if (pageUrl.includes('youtube.com/playlist')) {
        const playlistSelector =
          '#page-manager > ytd-browse > ytd-playlist-header-renderer > div > div.immersive-header-content.style-scope.ytd-playlist-header-renderer'
        const customId = 'kwiklern-root'
        await waitForElm(playlistSelector)
        const playlistElement = document.querySelector(playlistSelector)
        const myElement = document.createElement('div')
        myElement.id = customId
        myElement.style.width = '100%'
        playlistElement.insertBefore(myElement, playlistElement.firstChild)
        const videoElements = [...document.getElementsByTagName('ytd-playlist-video-renderer')]
        const initialVideosData = await Promise.all(
          videoElements.map(async (videoElement) => {
            const videoId = /\?v=([^&=?]*)/g.exec(
              videoElement?.querySelector('[id="video-title"]')?.getAttribute('href') || '',
            )?.[1]
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
            const videoElementId = `kwiklern-video-${videoId}`
            const myElement = document.createElement('div')
            myElement.id = videoElementId
            myElement.style.width = '100%'
            const appendElement = videoElement.querySelector('div[id="meta"]')
            appendElement.appendChild(myElement)
            return { videoId, videoUrl, videoElementId }
          }),
        )

        createRoot(document.getElementById(customId)).render(
          <YoutubePlaylist initialVideosData={initialVideosData} />,
        )
      }
    } catch (error) {
      devErr(error)
    }
  }
  injectCustomComponents()
}

function destructor() {
  // Destruction is needed only once
  document.removeEventListener(destructionEvent, destructor)
  // Tear down content script: Unbind events, clear timers, restore DOM, etc.
  trySilent(() => Browser.runtime.onMessage.removeListener(runtimeListener))
}

var destructionEvent = 'destructmyextension_' + chrome.runtime.id
// Unload previous content script if needed
document.dispatchEvent(new CustomEvent(destructionEvent))
document.addEventListener(destructionEvent, destructor)

main()
