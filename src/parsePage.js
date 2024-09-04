import { JSDOM } from 'jsdom'

export default function parsePage (body) {
  return new Promise((resolve, reject) => {
    const document = new JSDOM(body).window.document
    const articles = document.body.querySelectorAll('#content-main article')

    const result = Array.from(articles).map(article => {
      const item = {
        id: article.getAttribute('data-article-id'),
        href: article.querySelector('a').getAttribute('href'),
        title: (article.querySelector('h3 .kicker') ? article.querySelector('h3 .kicker').textContent.trim() + ': ' : '') + article.querySelector('h3 a').lastChild.textContent.trim()
      }

      return item
    })

    resolve(result)
  })
}
