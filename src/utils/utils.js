export function getPrompt(contentData) {
  const { content, title, author } = contentData
  return `Your output should use the following template:
  ### Summary
  ### Highlights
  - [Emoji] Bulletpoint
  
  Use up to 15 brief bullet points to summarize the content below, Choose an appropriate emoji for each bullet point. and summarize a short highlight: ${title} ${content}.`
}

export async function getPageFromUrl(linkUrl) {
  const res = await fetch(linkUrl)
  const pageHtml = await res.text()
  const pageUrl = res.url
  return { pageHtml, pageUrl }
}
