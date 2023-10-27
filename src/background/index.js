import { getConverTranscript, getLangOptionsWithLink } from './youtube-transcript'
import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderType, BASE_URL } from '../config'
import { ChatGPTProvider, getChatGPTAccessToken, sendMessageFeedback } from './providers/chatgpt'
import { OpenAIProvider } from './providers/openai'
import { extractFromHtml } from '@extractus/article-extractor'

console.log('background is running')

function getPrompt(content) {
  return `Summarize the following:
  ${content}`
}

const contexts = [
  {
    id: 'summarizeLink',
    title: 'Summarize link',
    contexts: ['link'],
  },
  {
    id: 'summarizePage',
    title: 'Summarize page',
    contexts: ['page'],
  },
]
contexts.forEach((context) => Browser.contextMenus.create(context))

// Add an event listener to handle the context menu item click
Browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (['summarizeLink', 'summarizePage'].includes(info.menuItemId)) {
    let pageHtml, pageUrl
    if (info.menuItemId === 'summarizeLink') {
      console.log('summarizeLinkClicked')
      const page = await getPageFromUrl(info.linkUrl)
      pageHtml = page.pageHtml
      pageUrl = page.pageUrl
    } else if (info.menuItemId === 'summarizePage') {
      console.log('summarizePageClicked')
      const page = await sendMessageToContentScript(tab.id, {
        action: 'GET_PAGE_HTML',
      })
      pageHtml = page.pageHtml
      pageUrl = page.pageUrl
    }

    const content = await getContentFromPage(pageHtml, pageUrl)
    console.log('CONTENT', content)
    // const port = Browser.runtime.connect()
    // const prompt = getPrompt(content)
    // port.onMessage.addListener((msg) => {
    //   if (msg.text) {
    //     let text = msg.text || ''
    //     text = text.replace(/^(\s|:\n\n)+|(:)+|(:\s)$/g, '')
    //     console.log(text)
    //   } else if (msg.error) {
    //     console.log(msg.error)
    //     port.onMessage.removeListener(listener)
    //     port.disconnect()
    //   } else if (msg.event === 'DONE') {
    //     console.log('done')
    //     port.onMessage.removeListener(listener)
    //     port.disconnect()
    //   }
    // })
    // port.postMessage({ question: prompt })
  }
  return true
})

Browser.runtime.onConnect.addListener(async (port) => {
  port.onMessage.addListener(async (msg) => {
    console.debug('received msg', msg)
    if (msg.question) {
      try {
        await generateAnswers(port, msg.question)
      } catch (err) {
        port.postMessage({ error: err.message })
      }
    }
  })
})

async function sendMessageToContentScript(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      resolve(response)
    })
  })
}

async function generateAnswers(port, question) {
  const providerConfigs = await getProviderConfigs()

  let provider
  if (providerConfigs.provider === ProviderType.ChatGPT) {
    const token = await getChatGPTAccessToken()
    provider = new ChatGPTProvider(token)
  } else if (providerConfigs.provider === ProviderType.GPT3) {
    const { apiKey, model } = providerConfigs.configs[ProviderType.GPT3]
    provider = new OpenAIProvider(apiKey, model)
  } else {
    throw new Error(`Unknown provider ${providerConfigs.provider}`)
  }

  const controller = new AbortController()
  port.onDisconnect.addListener(() => {
    controller.abort()
    cleanup?.()
  })

  const { cleanup } = await provider.generateAnswer({
    prompt: question,
    signal: controller.signal,
    onEvent(event) {
      if (event.type === 'done') {
        port.postMessage({ event: 'DONE' })
        return
      }
      port.postMessage(event.data)
    },
  })
}

async function getTranscript(pageHtml) {
  const langOptionsWithLink = await getLangOptionsWithLink(pageHtml)
  const transcriptList = await getConverTranscript({ langOptionsWithLink, videoId, index: 0 })
  const transcript = (
    transcriptList.map((v) => {
      return `${v.text}`
    }) || []
  ).join('')
  return transcript
}

async function getPageFromUrl(linkUrl) {
  const res = await fetch(linkUrl)
  const pageHtml = await res.text()
  const { pageUrl } = res
  return { pageHtml, pageUrl }
}

async function getTextContentFromHtml(pageHtml) {
  const article = await extractFromHtml(pageHtml)
  return article
}

async function getContentFromPage(pageHtml, pageUrl = '') {
  const isYoutubeLink = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(pageUrl)
  const content = !isYoutubeLink
    ? await getTextContentFromHtml(pageHtml)
    : await getTranscript(pageHtml)
  return content
}
