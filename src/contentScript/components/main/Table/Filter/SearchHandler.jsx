import nlp from 'compromise'

export const searchCache = { searchableTerms: {} }

export const processTokenizedDataRow = (summary) => {
  const { id, summaryText, contentText } = summary
  if (!('summaries' in searchCache)) searchCache.summaries = {}
  if (!('id' in searchCache.summaries)) searchCache.summaries[id] = {}
  const cachedSummary = searchCache.summaries[id]

  if (!('tokenizedSummaryText' in cachedSummary)) {
    cachedSummary.tokenizedSummaryText = nlp(summaryText).json()
    cachedSummary.tokenizedSummaryText.forEach((line) =>
      line.terms.forEach((term) => term.index.push(id)),
    )
  }
  if (!('tokenizedContentText' in cachedSummary)) {
    cachedSummary.tokenizedContentText = nlp(contentText).json()
  }

  if (!('searchableTerms' in searchCache)) searchCache.searchableTerms = {}
  const searchableTerms = searchCache.searchableTerms

  if (!('summary' in searchableTerms)) searchableTerms.summary = {}
  const searchableSummaryTerms = searchableTerms.summary
  const firstSummaryTerm = cachedSummary.tokenizedSummaryText?.[0]?.terms?.[0]
  if (
    firstSummaryTerm &&
    !(`${id}|${firstSummaryTerm.index[0]}|${firstSummaryTerm.index[1]}` in searchableSummaryTerms)
  ) {
    cachedSummary.tokenizedSummaryText.forEach((line) =>
      line.terms.forEach(
        (term) => (searchableSummaryTerms[`${id}|${term.index[0]}|${term.index[1]}`] = term),
      ),
    )
  }

  if (!('content' in searchableTerms)) searchableTerms.content = {}
  const searchableContentTerms = searchableTerms.content
  const firstContentTerm = cachedSummary.tokenizedContentText?.[0]?.terms?.[0]
  if (
    firstContentTerm &&
    !(`${id}|${firstContentTerm.index[0]}|${firstContentTerm.index[1]}` in searchableContentTerms)
  ) {
    cachedSummary.tokenizedContentText.forEach((line) =>
      line.terms.forEach(
        (term) => (searchableContentTerms[`${id}|${term.index[0]}|${term.index[1]}`] = term),
      ),
    )
  }
}
