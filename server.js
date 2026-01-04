#!/usr/bin/env node
import fs from 'fs'
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

    if (parameter.pathname !== '/') {
      if (parameter.pathname.match(/^\/[a-z0-9\.]+\.(html|css)$/)) {
        return serveFile(parameter.pathname, response)
      }
      if (parameter.pathname.match(/^\/dist\/app.js$/)) {
        return serveFile(parameter.pathname, response)
      }

      response.writeHead(404, {
      })
      return response.end('File not found')
    }

    const tags = parameter.query.tags ? parameter.query.tags.split(',') : []
    loadTagsArticlesDetails(tags, { params: parameter.query }, (err, result) => {
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

const contentTypes = {
  js: 'text/javascript',
  html: 'text/html',
  css: 'text/css',
}

function serveFile (file, response) {
  fs.readFile('.' + file, (err, body) => {
    if (err) {
      response.writeHead(404, {
      })
      return response.end(err.message)
    }

    const ext = file.match(/\.([a-z]*)$/)[1]
    response.writeHead(200, {
      'Content-Type': (contentTypes[ext] ?? 'text/plain') + ';chartset=utf-8'
    })

    response.end(body)
  })
}
