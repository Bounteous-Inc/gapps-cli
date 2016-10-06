'use strict'
const express = require('express')
/* Import all GS files*/

function run() {

  let app = express()
  
  app.get('/exec', (req, res) => {

    if (doGet) {

      // Call doGet

    }

  })

  app.post('/exec', (req, res) => {

    if (doPost) {

      // Call doPost

    }

  })

  // TODO switch to HTTPS for compliance
  app.listen(80)

}

module.exports = {
  run: run
}
