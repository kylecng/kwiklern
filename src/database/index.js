import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseKey } from '../secrets/secrets.supabase'
import { dataCache } from './dataCache'
import { keys } from 'lodash'

const isEmpty = (data) => {
  if (!data) return true
  if (Array.isArray(data)) {
    return data.length === 0
  }

  if (typeof data === 'object' && data !== null) {
    return keys(data).length === 0
  }

  return false
}

export const supabase = createClient(supabaseUrl, supabaseKey)
class Database {
  constructor() {}

  getAuthorId({ content, author }) {
    try {
      let id
      if (author?.id) id = author.id
      else if (content?.authorId) id = content.authorId
      else if (author?.url) id = author.url
      return { id }
    } catch (err) {
      return { error: err }
    }
  }

  getContentId({ summary, content }) {
    try {
      let id
      if (content?.id) id = content.id
      else if (summary?.contentId) id = summary.contentId
      else if (content?.type && content?.url) id = `${content.type}|${content.url}`
      return { id }
    } catch (err) {
      return { error: err }
    }
  }

  getSummaryId({ summary, content }) {
    try {
      let id
      const userId = this.user?.id

      if (summary?.id) id = summary.id
      else if (userId) {
        if (summary?.contentId) id = `${summary.contentId}|${userId}`
        else if (content?.type && content?.url) id = `${content.type}|${content.url}|${userId}`
      }
      return { id }
    } catch (err) {
      return { error: err }
    }
  }

  async getSession() {
    let data, error, user, session
    try {
      ;({ data, error } = await supabase.auth.getSession())
      if (error) throw error

      if (!isEmpty(data)) {
        ;({ user, session } = data)
        if (user) this.user = user
        if (session) this.session = session
      }
      return { user, session }
    } catch (err) {
      return { error: err }
    }
  }

  async signUp(email, password) {
    let data, error, user, session, userData
    try {
      ;({ data, error } = await supabase.auth.signUp({
        email,
        password,
      }))
      if (error) throw error

      if (!isEmpty(data)) {
        ;({ user, session } = data)
        if (user) this.user = user
        if (session) this.session = session
        ;({ userData, error } = await this.createUserData())
        if (userData) dataCache.userData = userData
      }
      return { user, session, userData }
    } catch (err) {
      return { error: err }
    }
  }

  async signInWithPassword(email, password) {
    let data, error, user, session, userData
    try {
      ;({ data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      }))
      if (error) throw error

      if (!isEmpty(data)) {
        ;({ user, session } = data)
        if (user) this.user = user
        if (session) this.session = session
        ;({ userData, error } = await this.getUserData())
        if (userData) dataCache.userData = userData
      }
      return { user, session, userData }
    } catch (err) {
      return { error: err }
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      return { error: err }
    }
  }

  async createUserData() {
    let data, error, userData
    try {
      ;({ data, error } = await supabase.from('userDatas').insert({ id: this.user?.id }).select())
      if (error) throw error

      if (!isEmpty(data)) {
        userData = data[0]
        dataCache.userData = userData
      }
      return { userData }
    } catch (err) {
      return { error: err, userData }
    }
  }

  async getUserData() {
    let data, error, userData
    try {
      ;({ data, error } = await supabase.from('userDatas').select().eq('id', this.user?.id))
      if (error) throw error

      if (!isEmpty(data)) {
        userData = data[0]
        dataCache.userData = userData
      }
      return { userData }
    } catch (err) {
      return { error: err, userData }
    }
  }

  async createAuthor(authorData) {
    let id, data, error, author
    try {
      const { name, url, domain, imageUrl } = authorData(
        ({ id, error } = this.getAuthorId({ author: authorData })),
      )
      if (error) throw error
      ;({ data, error } = await supabase
        .from('authors')
        .insert({ id, url, domain, name, imageUrl })
        .select())
      if (error) throw error

      if (!isEmpty(data)) {
        author = data[0]
      }

      dataCache.authors[id] = author
      return { author }
    } catch (err) {
      return { error: err, author }
    }
  }

  async getAuthor(authorData) {
    let id, data, error, author
    try {
      ;({ id, error } = this.getAuthorId({ author: authorData }))
      if (error) throw error
      if (!id) return {}
      if (dataCache.authors?.[id]) {
        return { author: dataCache.authors[id] }
      }
      ;({ data, error } = await supabase.from('authors').select().eq('id', id))
      if (error) throw error

      if (!isEmpty(data)) {
        author = data[0]
      } else {
        ;({ author, error } = await this.createAuthor(authorData))
      }

      dataCache.authors[id] = author
      return { author }
    } catch (err) {
      return { error: err, author }
    }
  }

  async createContent(contentData) {
    let id, data, error, content, author
    try {
      const {
        url,
        domain,
        type,
        title,
        author: authorData,
        authorName,
        text,
      } = contentData(({ id, error } = this.getContentId({ content: contentData })))
      if (error) throw error
      ;({ author, error } = await this.getAuthor(authorData))
      if (error) throw error
      ;({ data, error } = await supabase
        .from('contents')
        .insert({
          id,
          url,
          domain,
          type,
          title,
          authorId: author?.id || null,
          authorName: authorName || author?.name || '',
          text,
        })
        .select())
      if (error) throw error

      if (!isEmpty(data)) {
        content = data[0]
      }

      dataCache.contents[id] = content
      return { content, author }
    } catch (err) {
      return { error: err }
    }
  }

  async getContent(contentData) {
    let id, data, error, content, author
    try {
      ;({ id, error } = this.getContentId({ content: contentData }))
      if (error) throw error
      if (!id) return {}
      if (dataCache.contents?.[id]) {
        content = dataCache.contents[id]
        ;({ author, error } = await this.getAuthor({ url: content?.authorId }))
        if (error) throw error

        return { content, author }
      }
      ;({ data, error } = await supabase.from('contents').select().eq('id', id))
      if (error) throw error

      if (!isEmpty(data)) {
        content = data[0]
      } else {
        ;({ content, author, error } = await this.createContent(contentData))
        ;({ author, error } = await this.updateAuthorContentIds(author, id))
      }

      dataCache.contents[id] = content
      return { content, author }
    } catch (err) {
      return { error: err }
    }
  }

  async updateAuthorContentIds(author, contentId) {
    let data, error
    try {
      ;({ data, error } = await supabase
        .from('authors')
        .update({ contentIds: [...new Set([...(author?.contentIds || []), contentId])] })
        .eq('id', author?.id)
        .select())
      if (error) throw error

      if (!isEmpty(data)) {
        author = data[0]
      }

      if (author?.id) dataCache.authors[author.id] = author
      return { author }
    } catch (err) {
      return { error: err, author }
    }
  }

  async updateContentSummaryIds(content, summaryId) {
    let data, error
    try {
      ;({ data, error } = await supabase
        .from('contents')
        .update({ summaryIds: [...new Set([...(content?.summaryIds || []), summaryId])] })
        .eq('id', content?.id)
        .select())
      if (error) throw error

      if (!isEmpty(data)) {
        content = data[0]
      }

      if (content?.id) dataCache.contents[content.id] = content
      return { content }
    } catch (err) {
      return { error: err, content }
    }
  }

  async updateUserDataSummaryIds(userData, summaryId) {
    let data, error
    try {
      ;({ data, error } = await supabase
        .from('userDatas')
        .update({
          summaryIds: [...new Set([...(dataCache.userData?.summaryIds || []), summaryId])],
        })
        .eq('id', this.user?.id)
        .select())
      if (error) throw error

      if (!isEmpty(data)) {
        userData = data[0]
        dataCache.userData = userData
      }
      return { userData }
    } catch (err) {
      return { error: err, userData }
    }
  }

  async createSummary(summaryData, contentData) {
    let id, data, error, summary, content, author, userData
    try {
      ;({ id, error } = this.getSummaryId({ content: contentData }))
      if (error) throw error
      const { title, text, customTags, autoTags } = summaryData

      ;({ content, author, error } = await this.getContent(contentData))
      if (error) throw error
      ;({ data, error } = await supabase
        .from('summaries')
        .insert({
          id,
          contentId: content?.id,
          title: title || content?.title || null,
          text,
          customTags,
          autoTags,
        })
        .select())
      if (error) throw error

      if (!isEmpty(data)) {
        summary = data[0]
        ;({ content, error } = await this.updateContentSummaryIds(content, id))
        if (error) throw error
        ;({ userData, error } = await this.updateUserDataSummaryIds(dataCache.userData, id))
        if (error) throw error
      }

      dataCache.summaries[id] = summary
      return { userData, summary, content, author }
    } catch (err) {
      return { error: err }
    }
  }

  async updateSummary(summaryData, contentData) {
    let id, data, error, summary, content, author, userData
    try {
      ;({ id, error } = this.getSummaryId({ content: contentData }))
      if (error) throw error
      const { title, text, customTags, autoTags } = summaryData

      ;({ content, author, error } = await this.getContent(contentData))
      if (error) throw error
      ;({ data, error } = await supabase
        .from('summaries')
        .update({
          contentId: content?.id,
          title: title || content?.title || null,
          text,
          customTags,
          autoTags,
          dateModified: new Date(),
        })
        .eq('id', id)
        .select())
      if (error) throw error

      if (!isEmpty(data)) {
        summary = data[0]
        ;({ content, error } = await this.updateContentSummaryIds(content, id))
        if (error) throw error
        ;({ userData, error } = await this.updateUserDataSummaryIds(dataCache.userData, id))
        if (error) throw error
      }

      dataCache.summaries[id] = summary
      return { userData, summary, content, author }
    } catch (err) {
      return { error: err }
    }
  }

  async checkHasSummary(contentData) {
    let id, data, error, hasSummary
    try {
      ;({ id, error } = this.getSummaryId({ content: contentData }))
      if (error) throw error
      if (!isEmpty(dataCache.summaries?.[id])) {
        hasSummary = true

        return { hasSummary }
      }
      ;({ data, error } = await supabase.from('summaries').select('id').eq('id', id))
      if (error) throw error
      hasSummary = !isEmpty(data)
      return { hasSummary }
    } catch (err) {
      return { error: err }
    }
  }

  async checkHasSummaryBulk(contentDatas) {
    let id,
      data,
      error,
      hasSummaries = {}
    try {
      const ids = contentDatas
        .map(
          function (contentData) {
            ;({ id, error } = this.getSummaryId({ content: contentData }))
            if (error) throw error
            return id
          }.bind(this),
        )
        .filter(function (id) {
          if (!isEmpty(dataCache.summaries?.[id])) {
            hasSummaries[id] = { hasSummary: true }
            return false
          }
          return true
        })

      ;({ data, error } = await supabase.from('summaries').select('id').in('id', ids))
      if (error) throw error
      data.forEach(function (summary) {
        if (summary?.id) hasSummaries[summary.id] = { hasSummary: true }
      })
      return { hasSummaries }
    } catch (err) {
      return { error: err }
    }
  }

  async getSummary(contentData) {
    let id, data, error, summary, content, author
    try {
      ;({ id, error } = this.getSummaryId({ content: contentData }))
      if (error) throw error
      if (dataCache.summaries?.[id]) {
        summary = dataCache.summaries[id]
        ;({ content, author, error } = await this.getContent(contentData))
        if (error) throw error

        return { summary, content, author }
      }
      ;({ data, error } = await supabase.from('summaries').select().eq('id', id))
      if (error) throw error

      if (!isEmpty(data)) {
        summary = data[0]
        ;({ content, author, error } = await this.getContent(contentData))
      }
      dataCache.summaries[id] = summary
      return { summary, content, author }
    } catch (err) {
      return { error: err }
    }
  }

  async getSummaries() {
    try {
      if (!dataCache.userData) await this.getUserData()
      if (!dataCache.userData?.summaryIds) return []
      let summaries
      const { data, error } = await supabase
        .from('summaries')
        .select(
          'id,contents(id,url,domain,type,title,authors(id,url,domain,name,imageUrl),authorName,text),title,text,customTags,autoTags,dateCreated,dateModified',
        )
        .in('id', dataCache.userData.summaryIds)
      if (error) throw error

      summaries = data
      return { summaries }
    } catch (err) {
      return { error: err }
    }
  }
}

const database = new Database()
export { database as Database }
