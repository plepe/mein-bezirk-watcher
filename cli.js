#!/usr/bin/env node
import fs from 'fs'
import yaml from 'js-yaml'
import async from 'async'
import parsePage from './src/parsePage.js'

const config = yaml.load(fs.readFileSync('conf.yaml'))

let result = {}
async.each(config.tags, (tag, done) => {
  fetch('https://meinbezirk.at/tag/' + tag)
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
  console.log(JSON.stringify(result, null, '   '))
})
