import { devErr } from '../../utils'
import { extractFromHtml } from './extract'
import { isValidUrl, matchUrlProtocol } from './utils/linker'
import retrieve from './utils/retrieve'
import { getYoutubeTranscript } from './youtubeTranscript'

const extractSiteSpecificData = async (extractedData, pageHtml, url) => {
  if (!DOMParser) var { DOMParser } = await import('linkedom')
  const doc = new DOMParser().parseFromString(pageHtml, 'text/html')
  if (url.includes('youtube.com/watch')) {
    const videoId = /\?v\=([^\&\=\?]*)/.exec(extractedData?.url || '')?.[1]
    if (videoId) extractedData.url = `https://www.youtube.com/watch?v=${videoId}`
    extractedData.type = 'VIDEO'
    extractedData.text = await getYoutubeTranscript(pageHtml)
    extractedData.author.url = doc
      .querySelector('*[itemprop="author"] > *[itemprop="url"]')
      .getAttribute('href')
    extractedData.author.name = doc
      .querySelector('*[itemprop="author"] > *[itemprop="name"]')
      .getAttribute('content')
  }
}

const extractAuthorData = async (url, author) => {
  if (isValidUrl(author?.url)) {
    const authorUrl = matchUrlProtocol(url, author.url)
    const authorPageHtml = await retrieve(authorUrl)
    const extractedAuthorData = await extractFromHtml(authorPageHtml)
    author.name = extractedAuthorData.title || author.name
    author.imageUrl = extractedAuthorData.image
  }
}

export const extractContentData = async (input) => {
  try {
    const pageHtml = isValidUrl(input) ? await retrieve(input) : input
    const extractedData = await extractFromHtml(pageHtml)
    let { url, author } = extractedData
    await extractSiteSpecificData(extractedData, pageHtml, url)
    await extractAuthorData(url, author)
    return extractedData
  } catch (err) {
    devErr(err)
  }
}
