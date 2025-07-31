#!/usr/bin/env node
import fs from 'fs'
import yaml from 'js-yaml'
import async from 'async'
import loadArticle from './src/loadArticle.js'
import cache from './src/cache.js'
import loadTagArticles from './src/loadTagArticles.js'

const config = yaml.load(fs.readFileSync('conf.yaml'))

cache.open().then(() => run())

function run () {
  let result = {}

  async.each(config.tags, (tag, done) => {
    loadTagArticles(tag, config, (err, list) => {
      list.forEach(item => {
        if (!(item.id in result)) {
          result[item.id] = item
        }
      })

      done()
    })
  }, (err) => {
    if (err) {
      console.error(err)
    }

    async.map(result,
      (item, done) => {
        loadArticle(item)
          .then(_item => done(null, _item))
      },
      (err, result) => printResult(err, result)
    )
  })
}

function printResult (err, result) {
  if (err) {
    console.error(err)
  }

  result = Object.values(result)
  result = result.sort((a, b) => a.date > b.date ? 1 : -1)

  //console.log(JSON.stringify(result, null, '   '))
  result.forEach(item => {
    console.log('* ' + item.title + '\n  ' + item.href + '\n  ' + item.date + '\n')
  })

  cache.close()
}
