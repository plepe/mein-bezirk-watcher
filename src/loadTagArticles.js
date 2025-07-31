import queryString from 'query-string'
import parsePage from './parsePage.js'

export default function loadTagArticles (tag, config, callback) {
  let url = 'https://meinbezirk.at/tag/' + encodeURIComponent(tag)

  if (config.params) {
    url += '?' + queryString.stringify(config.params)
  }

  fetch(url)
    .then(req => req.text())
    .then(body => parsePage(body))
    .then(list => callback(null, list))
}
