import moment from 'moment'
import 'moment/locale/de'
import queryString from 'query-string'
import Events from 'events'

let form
let result

global.app = new Events()

window.onload = () => {
  result = document.querySelector('#result')
  form = document.querySelector('form')
  form.onchange = formChange

  if (location.search) {
    const parameter = queryString.parse(location.search)

    form.elements.loc.value = parameter.loc
    form.elements.tags.value = parameter.tags
  }

  window.addEventListener('popstate', urlChange)

  loadResults()
}

function urlChange () {
  const parameter = queryString.parse(location.search)

  form.elements.loc.value = parameter.loc
  form.elements.tags.value = parameter.tags

  loadResults()
}

function formChange () {
  const parameter = {
    tags: form.elements.tags.value,
    loc: form.elements.loc.value
  }

  result.innerHTML = ''
  if (parameter.tags === '') {
    return
  }

  let search = '?tags=' + encodeURIComponent(parameter.tags)
  if (parameter.loc) {
    search += '&loc=' + encodeURIComponent(parameter.loc)
  }

  history.pushState(parameter, '', search)

  loadResults()
}

function loadResults () {
  const parameter = {
    tags: form.elements.tags.value,
    loc: form.elements.loc.value
  }

  result.innerHTML = 'lade Ergebnisse ...'
  if (parameter.tags === '') {
    return
  }

  let url = './query?tags=' + encodeURIComponent(parameter.tags)
  if (parameter.loc) {
    url += '&loc=' + encodeURIComponent(parameter.loc)
  }

  fetch(url)
    .then(req => req.json())
    .then(data => {
      result.innerHTML = ''

      data.reverse().forEach(entry => {
        showEntry(entry)
      })
    })
}

function showEntry (entry) {
  const node = document.createElement('li')

  const a = document.createElement('a')
  a.className = 'title'
  a.href = entry.href
  a.target = '_blank'
  a.appendChild(document.createTextNode(entry.title))

  node.appendChild(a)

  const dateDisplay = document.createElement('span')
  dateDisplay.className = 'date'
  dateDisplay.appendChild(document.createTextNode(moment(entry.date).format('lll')))
  node.appendChild(dateDisplay)

  app.emit('showEntry', entry, node)

  result.appendChild(node)
}
