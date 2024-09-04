#!/usr/bin/env node
import fs from 'fs'
import yaml from 'js-yaml'
import async from 'async'

const config = yaml.load(fs.readFileSync('conf.yaml'))

async.each(config.tags, (tag, done) => {
  console.log(tag)
  done()
})
