import { createParser } from 'eventsource-parser'
import { isEmpty } from 'bellajs'
import { streamAsyncIterable } from './stream-async-iterable.js'
import { tryReturn } from '../utils.js'

export async function fetchSSE(resource, options) {
  const { onMessage, ...fetchOptions } = options
  const resp = await fetch(resource, fetchOptions)
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}))
    throw new Error(!isEmpty(error) ? JSON.stringify(error) : `${resp.status} ${resp.statusText}`)
  }
  const parser = createParser((event) => {
    if (event.type === 'event') {
      onMessage(event.data)
    }
  })
  for await (const chunk of streamAsyncIterable(resp.body)) {
    const str = new TextDecoder().decode(chunk)
    const socketUrl = tryReturn(() => JSON.parse(str)?.wss_url)
    if (socketUrl) {
      const socket = new WebSocket(socketUrl)
      socket.addEventListener('message', function (event) {
        const data = atob(JSON.parse(event.data).body).match(/data: (.*)/)?.[1]
        onMessage(data)
      })
    } else {
      parser.feed(str)
    }
  }
}
