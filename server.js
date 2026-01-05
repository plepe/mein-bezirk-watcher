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

    if (parameter.pathname !== '/query') {
      if (parameter.pathname === '/') {
        return serveFile('/index.html', response)
      }
      if (parameter.pathname.match(/^\/[a-z0-9\.]+\.(html|css|js|png|jpg|gif)$/)) {
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

      result = Object.values(result)
      result = result.sort((a, b) => a.date > b.date ? 1 : -1)

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
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
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
