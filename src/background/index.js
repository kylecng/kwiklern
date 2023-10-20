import { getConverTranscript, getLangOptionsWithLink } from './youtube-transcript'
console.log('background is running')
;(async () => {
  const videoId = 'LXsdt6RMNfY'
  try {
    // Get Transcript Language Options & Create Language Select Btns
    const langOptionsWithLink = await getLangOptionsWithLink(videoId)

    const transcriptList = await getConverTranscript({ langOptionsWithLink, videoId, index: 0 })

    const videoTitle = document.title
    // const videoUrl = window.location.href

    const transcript = (
      transcriptList.map((v) => {
        return `${v.text}`
      }) || []
    ).join('')

    console.log(transcript)
  } catch (e) {
    console.log(e)
  }
})()

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})

chrome.contextMenus.create({
  id: 'summarizeBackground',
  title: 'Summarize in background',
  contexts: ['link'],
})
chrome.contextMenus.create({
  id: 'summarizePage',
  title: 'Summarize page',
  contexts: ['page'],
})
chrome.contextMenus.create({
  id: 'summarizeText',
  title: 'Summarize text',
  contexts: ['selection'],
})
chrome.contextMenus.create({
  id: 'summarizeText2',
  title: 'Summarize text 2',
  contexts: ['selection'],
})

// Add an event listener to handle the context menu item click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarizeBackground') {
    // Handle the click event here
    console.log('Context menu item clicked!')
    chrome.tabs.sendMessage(tab.id, { action: 'summarizeBackgroundClicked' })
  } else if (info.menuItemId === 'summarizePage') {
    // Handle the click event here
    console.log('Context menu item clicked!')
    chrome.tabs.sendMessage(tab.id, { action: 'summarizePageClicked' })
  } else if (info.menuItemId === 'summarizePage') {
    // Handle the click event here
    console.log('Context menu item clicked!')
    chrome.tabs.sendMessage(tab.id, { action: 'summarizeText' })
  }
})
