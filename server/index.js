const express = require('express')
const { Nuxt } = require('nuxt')
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')

function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const host = process.env.HOST || '127.0.0.1'
  const port = process.env.PORT || 3000

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  console.log(`Server listening on http://${host}:${port}`)
}
start()
