import Browser from 'webextension-polyfill'

export async function sendMessageToBackground(message, timeout) {
  const messagePromise = new Promise((resolve) => {
    Browser.runtime.sendMessage(message, (response) => {
      console.log('request', message, '\nresponse', response)
      resolve(response)
    })
  })

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

export function getPrompt(contentData) {
  const { content, title, author } = contentData
  return `Your output should use the following template:
    ### Summary
    ### Highlights
    - [Emoji] Bulletpoint
    
    Use up to 15 brief bullet points to summarize the content below, Choose an appropriate emoji for each bullet point. and summarize a short highlight: ${title} ${content}.`
}
