import { isEmpty, isString } from 'bellajs'
import Browser from 'webextension-polyfill'
import { devErr, devLog } from '../utils'
import { Database } from '../database'
import { DEFAULT_OPTIONS } from '../constants'

export async function sendMessageToContentScript(tabId, message, timeout) {
  const messagePromise = (async () => {
    try {
      const response = await Browser.tabs.sendMessage(tabId, message)
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

export async function getPrompt(contentData, isUseAutoTags = true) {
  const { text, title } = contentData
  if (isEmpty(text)) return

  const { options, error } = await Database.getOptions()
  if (error) return
  const summaryPrompt = options?.summaryPrompt || DEFAULT_OPTIONS.summaryPrompt
  const summaryTemplate = options?.summaryTemplate || DEFAULT_OPTIONS.summaryTemplate

  if (!isString(summaryPrompt) || !isString(summaryTemplate)) return

  return `${summaryPrompt}\n${
    isUseAutoTags ? `Also return a comma-separated array of tags within brackets.\n` : ''
  }Your output should use the following template:\n${
    isUseAutoTags ? `### Tags [tag1, tag2, ...]\n` : ''
  }### Summary\n${summaryTemplate}\n\n${title} ${text}.`
}

export function parseSummaryText(text) {
  if (!isString(text) || !text) return {}
  let autoTags = []
  const tagMatches = [...text.matchAll(/\s*#*\s*Tags\s*\[([^\]]*)\]/gm)]
  if (tagMatches.length > 0) {
    const { 0: match, 1: group, index } = tagMatches[0]
    text = text.slice(match.length + index, text.length).trim()
    autoTags = group.split(',').map((tag) => tag.trim())
  }
  const summaryMatches = [...text.matchAll(/\s*#*\s*Summary\s*/gm)]
  if (summaryMatches.length > 0) {
    const { 0: match, index } = summaryMatches[0]
    text = text.slice(match.length + index, text.length).trim()
  }
  return { text, autoTags }
}
