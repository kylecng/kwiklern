import ExpiryMap from 'expiry-map'
import { v4 as uuidv4 } from 'uuid'
import { fetchSSE } from '../fetch-sse'
import { BASE_URL } from '../../config'
import { getSecurityToken } from './security'
import { devErr, devLog, trySilent } from '../../utils'

async function request(token, method, path, data) {
  return fetch(`${BASE_URL}/backend-api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
}

export async function sendMessageFeedback(token, data) {
  await request(token, 'POST', '/conversation/message_feedback', data)
}

export async function setConversationProperty(token, conversationId, propertyObject) {
  await request(token, 'PATCH', `/conversation/${conversationId}`, propertyObject)
}

const KEY_ACCESS_TOKEN = 'accessToken'

const cache = new ExpiryMap(10 * 1000)

export async function getChatGPTAccessToken() {
  if (cache.get(KEY_ACCESS_TOKEN)) {
    return cache.get(KEY_ACCESS_TOKEN)
  }
  const resp = await fetch(`${BASE_URL}/api/auth/session`)
  if (resp.status === 403) {
    throw new Error('CLOUDFLARE')
  }
  const data = await resp.json().catch(() => ({}))
  if (!data.accessToken) {
    throw new Error('UNAUTHORIZED')
  }
  cache.set(KEY_ACCESS_TOKEN, data.accessToken)
  return data.accessToken
}

export class ChatGPTProvider {
  constructor(token) {
    this.token = token
  }

  async fetchModels() {
    const resp = await request(this.token, 'GET', '/models').then((r) => r.json())
    return resp.models
  }

  async getModelName() {
    try {
      const models = await this.fetchModels()
      return models[0].slug
    } catch (err) {
      devErr(err)
      return 'text-davinci-002-render-sha'
    }
  }

  async generateAnswer(params) {
    const security_token = getSecurityToken && getSecurityToken()

    let conversationId

    const cleanup = () => {
      if (conversationId) {
        setConversationProperty(this.token, conversationId, {
          is_visible: false,
        })
      }
    }

    const modelName = await this.getModelName()

    await fetchSSE(`${BASE_URL}/backend-api/conversation`, {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        action: 'next',
        messages: [
          {
            id: uuidv4(),
            role: 'user',
            content: {
              content_type: 'text',
              parts: [params.prompt],
            },
          },
        ],
        model: modelName,
        arkose_token: security_token || null,
        parent_message_id: uuidv4(),
        timezone_offset_min: new Date().getTimezoneOffset(),
      }),
      onMessage(message) {
        // console.debug('sse message', message)
        if (message === '[DONE]') {
          params.onEvent({ type: 'done' })
          cleanup()
          return
        }
        let data
        try {
          data = JSON.parse(message)
        } catch (err) {
          console.error(err)
          return
        }
        const text = data.message?.content?.parts?.[0]
        if (text) {
          conversationId = data.conversation_id
          params.onEvent({
            type: 'answer',
            data: {
              text,
              messageId: data.message.id,
              conversationId: data.conversation_id,
            },
          })
        }
      },
    })
    return { cleanup }
  }
}
