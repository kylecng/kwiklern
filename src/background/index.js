import { getConverTranscript, getLangOptionsWithLink } from './youtube-transcript'
import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderType, BASE_URL } from '../config'
import { ChatGPTProvider, getChatGPTAccessToken, sendMessageFeedback } from './providers/chatgpt'
import { OpenAIProvider } from './providers/openai'
import { sendMessageToContentScript, getPageFromUrl } from './utils'
import { signUpNewUser } from '../db'

console.info(
  'BACKGROUND IS RUNNING =======================================================================================================================================================================================================================================================================================================================================================',
)

Browser.runtime.onConnect.addListener(async (port) => {
  port.onMessage.addListener(async (msg) => {
    // console.debug('received msg', msg)
    if (msg.question) {
      try {
        await generateAnswers(port, msg)
      } catch (err) {
        port.postMessage({ error: err.message })
      }
    }
  })
})

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
      const page = await getPageFromUrl(info.linkUrl)
      pageHtml = page?.pageHtml
      pageUrl = page?.pageUrl
    } else if (info.menuItemId === 'summarizePage') {
      const page = await sendMessageToContentScript(tab.id, {
        action: 'GET_PAGE_HTML',
      })
      console.log('page', page)
      pageHtml = page?.pageHtml
      pageUrl = page?.pageUrl
    }

    const content = await getContentDataFromPage(pageHtml, pageUrl, tab.id)
    console.log('CONTENT', content)


    await sendMessageToContentScript(tab.id, {
      action: 'CALL_SUMMARY',
      data: { content },
    })
    return true
  }
})

async function generateAnswers(port, msg) {
  const { question } = msg
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

async function getVideoData(pageHtml, tabId) {
  const extractedData = await sendMessageToContentScript(
    tabId,
    {
      action: 'EXTRACT_VIDEO_DATA',
      data: { pageHtml },
    },
    10000,
  )
  return extractedData
}

async function getArticleData(pageHtml, tabId) {
  const extractedData = await sendMessageToContentScript(
    tabId,
    {
      action: 'EXTRACT_ARTICLE_DATA',
      data: { pageHtml },
    },
    10000,
  )
  return extractedData
}

async function getContentDataFromPage(pageHtml, pageUrl = '', tabId) {
  const isYoutubeLink = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(pageUrl)
  // console.log('isYoutubeLink', isYoutubeLink)
  const content = !isYoutubeLink
    ? await getArticleData(pageHtml, tabId)
    : await getVideoData(pageHtml, tabId)
  return content
}

Browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('message', message)
  if (message.action === 'SIGNUP_EMAIL_PASSWORD') {
    signUpNewUser(message.data.email, message.data.password).then(({ data, error }) => {
      console.log({ data, error })
      sendResponse({ success: !error })
    })
  }
  return true
})
