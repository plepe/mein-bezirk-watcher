import async from 'async'
import queryString from 'query-string'
import parsePage from './parsePage.js'
import loadTagArticles from './loadTagArticles.js'

export default function loadTagsArticles (tags, config, callback) {
  const result = {}

  async.each(tags, (tag, done) => {
    loadTagArticles(tag, config, (err, list) => {
      list.forEach(item => {
        if (!(item.id in result)) {
          result[item.id] = item
        }
      })

      done()
    })
  }, (err) => {
    if (err) { return callback(err) }

    callback(null, Object.values(result))
  })
}
