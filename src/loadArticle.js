import { JSDOM } from 'jsdom'
import cache from './cache.js'

let articleCache
cache.open().then(() => {
  articleCache = cache.loki.addCollection('loadArticle')
})

export default function loadArticle (item) {
  return new Promise((resolve, reject) => {
    const result = articleCache.findOne({ id: { $eq: item.id } })

    if (result) {
      resolve(result)
    } else {
      _loadArticle(item)
        .then(item => resolve(item))
        .catch(err => reject(err))
    }
  })
}

function _loadArticle (item) {
  return new Promise((resolve, reject) => {
    fetch(item.href)
      .then(req => req.text())
      .then(body => {
        const document = new JSDOM(body).window.document

        Array
          .from(document.querySelectorAll('meta[property]'))
          .forEach(meta => {
            const property = meta.getAttribute('property')
            // console.log(meta.getAttribute('property'), meta.getAttribute('content'))
            if (property === 'article:published_time') {
              item.date = meta.getAttribute('content') 
            }
          })

        articleCache.insert(item)
        resolve(item)
      })
  })
}

