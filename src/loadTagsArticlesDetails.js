import async from 'async'
import loadArticle from './loadArticle.js'
import loadTagsArticles from './loadTagsArticles.js'

export default function loadTagsArticlesDetails (tags, config, callback) {
  loadTagsArticles(tags, config, (err, result) => {
        console.log(err, result)
    if (err) {
      console.error(err)
    }

    async.map(result,
      (item, done) => {
        loadArticle(item)
          .then(_item => done(null, _item))
      },
      (err, result) => callback(err, result)
    )
  })
}
