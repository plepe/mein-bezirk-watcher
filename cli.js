#!/usr/bin/env node
import fs from 'fs'
import yaml from 'js-yaml'
import async from 'async'
import queryString from 'query-string'
import parsePage from './src/parsePage.js'
import loadArticle from './src/loadArticle.js'

const config = yaml.load(fs.readFileSync('conf.yaml'))

let result = {}
async.each(config.tags, (tag, done) => {
  let url = 'https://meinbezirk.at/tag/' + tag

  if (config.params) {
    url += '?' + queryString.stringify(config.params)
  }

  fetch(url)
    .then(req => req.text())
    .then(body => parsePage(body))
    .then(list => {
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

  result = Object.values(result)
  async.map(result, (item, done) => loadArticle(item, done)
    .then((err, _item) => {
      item[item.id] = _item
      done()
    }),
    printResult
  )
})

function printResult (err) {
  if (err) {
    console.error(err)
  }

  result = result.sort((a, b) => a.date > b.date ? -1 : 1)

  console.log(JSON.stringify(result, null, '   '))
}
