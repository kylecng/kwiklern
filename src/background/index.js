import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderType } from '../config'
import { ChatGPTProvider, getChatGPTAccessToken } from './providers/chatgpt'
import { OpenAIProvider } from './providers/openai'
import { getPrompt, parseSummaryText, sendMessageToContentScript } from './utils'
import { Database } from '../database'
import { isEmpty, isString } from 'bellajs'
import EventEmitter from 'events'
import { trySilent, devLog, devErr, devInfo, getErrStr, IS_DEV_MODE } from '../utils'
import { testEmail, testPassword } from '../secrets/secrets.supabase'

devInfo(
  'BACKGROUND IS RUNNING =======================================================================================================================================================================================================================================================================================================================================================',
)

// REMOVE
if (IS_DEV_MODE) Database.signInWithPassword(testEmail, testPassword)

Database.getSession()

Browser.runtime.onConnect.addListener(async (port) => {
  port.onMessage.addListener(async (msg) => {
    if (
      !msg ||
      msg?.data === 'ping' ||
      msg?.data === '{"type":"ping"}' ||
      msg?.type === 'connected'
    )
      return
    const { prompt, isSendStatusOnly, isUseAutoTags, hasStoredSummary, contentData, summaryData } =
      msg
    if (!prompt || !isString(prompt)) return
    const { emitter, controller } = messageHandler({
      port,
      isSendStatusOnly,
      isUseAutoTags,
      hasStoredSummary,
      contentData,
      summaryData,
    })
    await generateAnswers({ emitter, controller, prompt })
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

;(async () => {
  await Browser.contextMenus.removeAll()
  contexts.forEach((context) => Browser.contextMenus.create(context))
})()

// Add an event emitter to handle the context menu item click
Browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (['summarizeLink', 'summarizePage'].includes(info.menuItemId)) {
    const { user, session, error } = await Database.getSession()
    if (error || isEmpty(session)) {
      return
    }

    const data =
      info.menuItemId === 'summarizeLink'
        ? { linkUrl: info.linkUrl }
        : info.menuItemId === 'summarizePage'
          ? {}
          : null

    const response = await sendMessageToContentScript(tab.id, {
      action: 'CALL_SUMMARY_STREAM',
      data,
    })
    if (!response) return
    const { summaryData, contentData } = response
    await Database.createSummary(summaryData, contentData)
  }
})

async function generateAnswers({ emitter, controller, prompt }) {
  if (!prompt || !isString(prompt)) return
  let cleanup
  try {
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

    ;({ cleanup } = await provider.generateAnswer({
      prompt,
      signal: controller.signal,
      onEvent(event) {
        // const msg = event.status === 'DONE' ? { status: 'DONE' } : event.data
        emitter?.emit('message', event)
      },
    }))
  } catch (error) {
    trySilent(() => emitter?.emit('message', { error: error, status: 'ERROR' }))
  } finally {
    trySilent(() => cleanup?.())
    trySilent(() => emitter.emit('doCleanup', () => {}))
  }
}

const handleDatabaseCall = (func, params = [], sendResponse) => {
  if (Database[func].constructor.name === 'AsyncFunction') {
    Database[func](...params)
      .then(({ error, ...data }) => {
        if (error) throw error
        sendResponse({ ...data })
      })
      .catch((error) => {
        devErr(error)
        sendResponse({ error })
      })
  } else {
    try {
      const data = Database[func](...params)
      sendResponse(data)
    } catch (error) {
      devErr(error)
      sendResponse({ error })
    }
  }
}

Browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === 'OPEN_MAIN_PAGE') {
    chrome.tabs.create({ url: chrome.runtime.getURL('main.html') })
    sendResponse({})
  } else if (message?.action === 'GET_PROMPT') {
    getPrompt(message?.data?.contentData, message?.data?.isUseAutoTags)
      .then((prompt) => {
        sendResponse({ prompt })
      })
      .catch((error) => {
        devErr(error)
        sendResponse({ error })
      })
  } else if (message?.type === 'DATABASE') {
    handleDatabaseCall(message?.action, message?.data, sendResponse)
  } else {
    const errMsg = 'Invalid message to background'
    devErr(errMsg, message)
    sendResponse({ error: errMsg })
  }

  return true
})

const messageHandler = ({
  port,
  isSendStatusOnly,
  isUseAutoTags,
  hasStoredSummary,
  contentData,
  summaryData,
}) => {
  const controller = new AbortController()
  const emitter = new EventEmitter()

  let text, autoTags
  emitter.on('message', async (msg) => {
    if (!msg) return
    const { status, error, data } = msg
    const outMsg = {}
    const { text: newText, autoTags: newAutoTags } = parseSummaryText(data?.text)
    if (isString(newText) && newText) text = newText
    if (isUseAutoTags && !isEmpty(newAutoTags)) autoTags = newAutoTags

    if (isSendStatusOnly) {
      if (status) {
        trySilent(() => port?.postMessage({ status, error: getErrStr(error) }))
      }
    } else {
      trySilent(() =>
        port?.postMessage({
          status,
          error: getErrStr(error),
          data: {
            ...data,
            ...(isString(newText) && newText ? { text: newText } : {}),
            ...(isUseAutoTags && !isEmpty(newAutoTags) ? { autoTags: newAutoTags } : {}),
          },
        }),
      )
    }

    if (status === 'DONE') {
      summaryData = {
        ...summaryData,
        ...(isString(text) && text ? { text } : {}),
        ...(isUseAutoTags && !isEmpty(autoTags) ? { autoTags } : {}),
      }

      try {
        let { hasSummary, error } = await Database.checkHasSummary(contentData)
        if (error) throw error
        ;({ error } = hasSummary
          ? await Database.updateSummary(summaryData, contentData)
          : await Database.createSummary(summaryData, contentData))
        if (error) throw error
      } catch (err) {
        devErr(err)
      }
    }
  })

  emitter.on('doCleanup', () => {
    trySilent(() => controller?.abort())
    trySilent(() => emitter?.removeAllListeners())
    trySilent(() => port?.postMessage({ status: 'DISCONNECT' }))
  })

  port?.onDisconnect.addListener(() => {
    emitter.emit('doCleanup', () => {})
  })
  return { emitter, controller }
}

// try {
//   const prompt = `Who are you?`
//   const { emitter, controller } = messageHandler({})
//   generateAnswers({ emitter, controller, prompt })
// } catch (error) {
//   devErr(error)
// }
