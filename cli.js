#!/usr/bin/env node
import fs from 'fs'
import yaml from 'js-yaml'
import async from 'async'
import parsePage from './src/parsePage.js'

const config = yaml.load(fs.readFileSync('conf.yaml'))

async.each(config.tags, (tag, done) => {
  fetch('https://meinbezirk.at/tag/' + tag)
    .then(req => req.text())
    .then(body => parsePage(body))
    .then(list => {
      console.log(list)
      done()
    })
})
