import LokiJS from 'lokijs'

let cbs = []
const loki = new LokiJS('data/cache.db', {
  autoload: true,
  autoloadCallback: () => {
    cbs.forEach(cb => cb.resolve())
    cbs = null
  },
  autosave: true,
})

export default {
  loki,
  open () {
    return new Promise((resolve, reject) => {
      if (cbs) {
        cbs.push({ resolve, reject })
      } else {
        resolve()
      }
    })
  },
  close () {
    loki.close()
  }
}
