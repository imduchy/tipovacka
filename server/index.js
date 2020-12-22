const express = require('express')
const { loadNuxt, build } = require('nuxt')
const app = express()

const isDev = process.env.NODE_ENV !== 'production'

async function start() {
  // Init Nuxt.js
  const nuxt = await loadNuxt(isDev ? 'dev' : 'start')

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (isDev) {
    build(nuxt)
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  console.log(`Server listening on http://${host}:${port}`)
}
start()
