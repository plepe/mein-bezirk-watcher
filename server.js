#!/usr/bin/env node
import http from 'http'
import { ArgumentParser } from 'argparse'
import url from 'url'
import loadTagsArticlesDetails from './src/loadTagsArticlesDetails.js'

const defaultConfig = {
  port: 8080,
  ip: '0.0.0.0',
}

const parser = new ArgumentParser({
  add_help: true,
  description: 'Starts an overpass-frontend server'
})

parser.add_argument('--port', '-p', {
  help: 'Port to listen on',
  default: defaultConfig.port
})

parser.add_argument('--ip', {
  help: 'IP to listen on',
  default: defaultConfig.ip
})

const config = { ...parser.parse_args() }

const server = http.createServer(handleRequest)

server.listen(config.port, config.ip)

function handleRequest (request, response) {
  let body = ''

  request.on('data', (data) => {
    body += data
  })

  request.on('end', () => {
    const parameter = url.parse(request.url, true)
    const tags = parameter.query.tags.split(',')
    loadTagsArticlesDetails(tags, parameter.query, (err, result) => {
      if (err) {
        return handleResult(err)
      }

      if (Array.isArray(result)) {
        result = result.map(entry => {
          entry = { ...entry }
          delete entry.meta
          delete entry.$loki
          return entry
        })
      }

      handleResult(err, result)
    })

    function handleResult (err, result) {
      if (err) {
        response.writeHead(400, {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        })
        console.error('Error loading data from API', err)
        return response.end(err.message)
      }

      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
      response.end(JSON.stringify(result, null, '  '))
    }
  })
}
