import Browser from 'webextension-polyfill'

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
export const DEFAULT_MODEL = 'gpt-3.5-turbo'
export const DEFAULT_API_HOST = 'api.openai.com'
