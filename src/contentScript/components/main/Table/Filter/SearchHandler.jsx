import nlp from 'compromise'
import markdownToTxt from 'markdown-to-txt'

export const searchCache = { searchableTerms: {}, summaries: {} }

export const processTokenizedData = (rows) => {
  if (!('searchableTerms' in searchCache)) searchCache.searchableTerms = {}
  if (!('summaries' in searchCache)) searchCache.summaries = {}
  rows.forEach((row) => processTokenizedDataRow(row))
}

export const processTokenizedDataRow = (row) => {
  const { id, summaryText, contentText, title } = row
  if (!('id' in searchCache.summaries)) searchCache.summaries[id] = {}
  const cachedSummary = searchCache.summaries[id]
  const { searchableTerms } = searchCache
  processTextType('summaryText', id, summaryText, searchableTerms, cachedSummary)
  // processTextType("content", id, contentText, searchableTerms, cachedSummary);
  processTextType('title', id, title, searchableTerms, cachedSummary)
}

const processTextType = (textType, id, text, searchableTerms, cachedSummary) => {
  const textTypeTokenizedKey = `${textType}Tokenized`

  if (!(textTypeTokenizedKey in cachedSummary)) {
    cachedSummary[textTypeTokenizedKey] = nlp(markdownToTxt(text)).json()
    cachedSummary[textTypeTokenizedKey].forEach((line) =>
      line.terms.forEach((term) => term.index.push(id, textType)),
    )
  }

  if (!(textType in searchableTerms)) searchableTerms[textType] = {}
  const terms = searchableTerms[textType]
  const firstTerm = cachedSummary?.[textTypeTokenizedKey]?.[0]?.terms?.[0]
  if (firstTerm && !(`${textType}|${id}|${firstTerm.index[0]}|${firstTerm.index[1]}` in terms)) {
    cachedSummary?.[textTypeTokenizedKey].forEach((line) =>
      line.terms.forEach(
        (term) => (terms[`${textType}|${id}|${term.index[0]}|${term.index[1]}`] = term),
      ),
    )
  }
}
