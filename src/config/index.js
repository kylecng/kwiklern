import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'

export let TriggerMode
;(function (TriggerMode) {
  TriggerMode['Always'] = 'always'
  TriggerMode['QuestionMark'] = 'questionMark'
  TriggerMode['Manually'] = 'manually'
})(TriggerMode || (TriggerMode = {}))

export const TRIGGER_MODE_TEXT = {
  [TriggerMode.Always]: {
    title: 'Always',
    desc: 'ChatGPT is queried on every search',
  },
  [TriggerMode.Manually]: {
    title: 'Manually',
    desc: 'ChatGPT is queried when you manually click a button',
  },
}

export let Theme
;(function (Theme) {
  Theme['Auto'] = 'auto'
  Theme['Light'] = 'light'
  Theme['Dark'] = 'dark'
})(Theme || (Theme = {}))

export let Language
;(function (Language) {
  Language['Auto'] = 'auto'
  Language['English'] = 'en-US'
  Language['ChineseSimplified'] = 'zh-Hans'
  Language['ChineseTraditional'] = 'zh-Hant'
  Language['Spanish'] = 'es-ES'
  Language['French'] = 'fr-FR'
  Language['Korean'] = 'ko-KR'
  Language['Japanese'] = 'ja-JP'
  Language['German'] = 'de-DE'
  Language['Portuguese'] = 'pt-PT'
  Language['Russian'] = 'ru-RU'
})(Language || (Language = {}))

const userConfigWithDefaultValue = {
  triggerMode: TriggerMode.Always,
  theme: Theme.Auto,
  language: Language.Auto,
  prompt: '',
  promptSearch: '',
  promptPage: '',
  promptComment: '',
  enableSites: null,
  pageSummaryEnable: true,
  pageSummaryWhitelist: '',
  pageSummaryBlacklist: '',
  continueConversation: true,
}

export async function getUserConfig() {
  const result = await Browser.storage.local.get(Object.keys(userConfigWithDefaultValue))
  return defaults(result, userConfigWithDefaultValue)
}

export async function updateUserConfig(updates) {
  console.debug('update configs', updates)
  return Browser.storage.local.set(updates)
}

export let ProviderType
;(function (ProviderType) {
  ProviderType['ChatGPT'] = 'chatgpt'
  ProviderType['GPT3'] = 'gpt3'
})(ProviderType || (ProviderType = {}))

export async function getProviderConfigs() {
  const { provider = ProviderType.ChatGPT } = await Browser.storage.local.get('provider')
  const configKey = `provider:${ProviderType.GPT3}`
  const result = await Browser.storage.local.get(configKey)
  return {
    provider,
    configs: {
      [ProviderType.GPT3]: result[configKey],
    },
  }
}

export async function saveProviderConfigs(provider, configs) {
  return Browser.storage.local.set({
    provider,
    [`provider:${ProviderType.GPT3}`]: configs[ProviderType.GPT3],
  })
}

export const BASE_URL = 'https://chat.openai.com'

export const DEFAULT_PAGE_SUMMARY_BLACKLIST = `https://translate.google.com
https://www.deepl.com
https://www.youtube.com
https://youku.com
https://v.qq.com
https://www.iqiyi.com
https://www.bilibili.com
https://www.tudou.com
https://www.tiktok.com
https://vimeo.com
https://www.dailymotion.com
https://www.twitch.tv
https://www.hulu.com
https://www.netflix.com
https://www.hbomax.com
https://www.disneyplus.com
https://www.peacocktv.com
https://www.crunchyroll.com
https://www.funimation.com
https://www.viki.com
https://map.baidu.com
`
export const APP_TITLE = `Glarity Summary`

export const DEFAULT_MODEL = 'gpt-3.5-turbo'
export const DEFAULT_API_HOST = 'api.openai.com'
