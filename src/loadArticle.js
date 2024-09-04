import { JSDOM } from 'jsdom'

export default function loadArticle (item) {
  return new Promise((resolve, reject) => {
    fetch(item.href)
      .then(req => req.text())
      .then(body => {
        const document = new JSDOM(body).window.document

        Array
          .from(document.querySelectorAll('meta[property]'))
          .forEach(meta => {
            const property = meta.getAttribute('property')
            // console.log(meta.getAttribute('property'), meta.getAttribute('content'))
            if (property === 'article:published_time') {
              item.date = meta.getAttribute('content') 
            }
          })

        resolve(item)
      })
  })
}

