import moment from 'moment'
import 'moment/locale/de'

let form
let result

window.onload = () => {
  result = document.querySelector('#result')
  form = document.querySelector('form')
  form.onchange = loadResults
  loadResults()
}

function loadResults () {
  const parameter = {
    tags: form.elements.tags.value,
    loc: form.elements.loc.value
  }

  result.innerHTML = ''
  if (parameter.tags === '') {
    return
  }

  let url = '.?tags=' + encodeURIComponent(parameter.tags)
  if (parameter.loc) {
    url += '&loc=' + encodeURIComponent(parameter.loc)
  }

  fetch(url)
    .then(req => req.json())
    .then(data => {
      data.reverse().forEach(entry => {
        showEntry(entry)
      })
    })
}

function showEntry (entry) {
  const node = document.createElement('li')

  const a = document.createElement('a')
  a.href = entry.href
  a.target = '_blank'
  a.appendChild(document.createTextNode(entry.title))

  node.appendChild(a)

  const dateDisplay = document.createElement('span')
  dateDisplay.className = 'date'
  dateDisplay.appendChild(document.createTextNode(moment(entry.date).format('lll')))
  node.appendChild(dateDisplay)

  result.appendChild(node)
}
