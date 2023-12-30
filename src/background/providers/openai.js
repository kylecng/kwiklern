import { fetchSSE } from '../fetch-sse'
import { getProviderConfigs, ProviderType, DEFAULT_MODEL, DEFAULT_API_HOST } from '../../config'
import { devErr, trySilent } from '../../utils'

export class OpenAIProvider {
  constructor(token, model) {
    this.token = token
    this.model = model
    this.token = token
    this.model = model
  }

  buildPrompt(prompt) {
    if (this.model.startsWith('text-chat-davinci')) {
      return `Respond conversationally.<|im_end|>\n\nUser: ${prompt}<|im_sep|>\nChatGPT:`
    }
    return prompt
  }

  buildMessages(prompt) {
    return [{ role: 'user', content: prompt }]
  }

  async generateAnswer(params) {
    const [config] = await Promise.all([getProviderConfigs()])

    const gptModel = config.configs[ProviderType.GPT3]?.model ?? DEFAULT_MODEL
    const apiHost = config.configs[ProviderType.GPT3]?.apiHost || DEFAULT_API_HOST
    const apiPath = config.configs[ProviderType.GPT3]?.apiPath

    let url = ''
    let reqParams = {
      model: this.model,
      // prompt: this.buildPrompt(params.prompt),
      // messages: this.buildMessages(params.prompt),
      stream: true,
      max_tokens: 800,
      // temperature: 0.5,
    }
    if (gptModel === 'text-davinci-003') {
      url = `https://${apiHost}${apiPath || '/v1/completions'}`
      reqParams = {
        ...reqParams,
        ...{ prompt: this.buildPrompt(params.prompt) },
      }
    } else {
      url = `https://${apiHost}${apiPath || '/v1/chat/completions'}`
      reqParams = {
        ...reqParams,
        ...{ messages: this.buildMessages(params.prompt) },
      }
    }

    let result = ''
    try {
      await fetchSSE(url, {
        method: 'POST',
        signal: params.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(reqParams),
        onMessage(message) {
          try {
            if (message === '[DONE]') {
              params.onEvent({ status: 'DONE' })
              return
            }
            let data
            data = JSON.parse(message)
            const text =
              gptModel === 'text-davinci-003' ? data.choices[0].text : data.choices[0].delta.content

            if (text === undefined || text === '<|im_end|>' || text === '<|im_sep|>') {
              return
            }
            result += text
            params.onEvent({
              status: 'ANSWER',
              data: {
                text: result,
                messageId: data.id,
                conversationId: data.id,
              },
            })
          } catch (err) {
            devErr(err)
            return
          }
        },
      })
    } catch (err) {
      devErr(err)
      // throw err
      trySilent(params.onEvent({ status: 'ERROR', error: err }))
    } finally {
      return {}
    }
  }
}
