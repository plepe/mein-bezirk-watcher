#!/usr/bin/env node
import fs from 'fs'
import yaml from 'js-yaml'
import cache from './src/cache.js'
import loadTagsArticlesDetails from './src/loadTagsArticlesDetails.js'

const config = yaml.load(fs.readFileSync('conf.yaml'))

cache.open().then(() => run())

function run () {
  loadTagsArticlesDetails(config.tags, config,
    (err, result) => printResult(err, result)
  )
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
