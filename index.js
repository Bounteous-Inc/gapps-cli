#!/usr/bin/env node
'use strict'

const google = require('googleapis')
const prompt = require('prompt')
const minimist = require('minimist')
const configDirPath = __dirname + '/.gapps'
const ignoreFilePath = __dirname + '/.gappsignore'
const tokenFilePath = configDirPath + '/token.json'
const express = require('express')
const fs = require('fs')
const async = require('async')
const GASServer = require('./lib/GASServer.js')

const clientId = '44544723576-4j6pi07nh525fo4q40nqav73svgditkd.apps.googleusercontent.com'
const clientSecret = 'tqrdbO1KOJbNf0o3eqXH3lc1'

let argv = require('minimist')(process.argv.slice(2));

setup()

function setup() {

  if (!findConfig()) {

    async.each([
      // Check required configs
      checkDirectory,
      checkToken,
      checkProjectId  
    ], (err, result) => {

      if (err) return console.log(err.message)

      init()      

    })

  }

}

function checkDirectory(callback) {

  if (!fs.existsSync(configDirPath)) {

    fs.mkdirSync(configDirPath);

  }

  callback(null)

}

function checkToken(callback) {

  if (getToken_()) return callback(null)

  // Token can be passed in as an argument
  if (argv.token) {

    storeToken_(tokenFilePath, {access_token: argv.token})
    callback(null)

  } else {

    generateToken_(function(err, tokens) {

      if (err) return callback(err)

      storeToken_(tokenFilePath, tokens)
      callback(null)

    })

  }

}

function checkProjectId() {

  if (!getProjectId_()) {

    if (argv.projectId) {

      storeProjectId_(argv.projectId)

    } else {

      prompt.get({
        properties: {
          fileId: {
            description: 'What is the File ID of the project?'
          }
        }
      }, function(err, result) {

        console.log(result)

      })

    }

  }

}

// Prompts user to open browser, gets token for API
function generateToken_(callback) {

  let OAuth2 = google.auth.OAuth2
  let redirectUri = 'http://localhost:8080/redirect'
  let scope = ['drive', 'drive.file'].map((name) => 'https://www.googleapis.com/auth/' + name)
  let oauth2Client = new OAuth2(clientId, clientSecret, redirectUri)
  let url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scope
  }) 
  let server = express()
  let ref

  server.get('/redirect', (req, res) => {

    if(!req.query.code) return console.error('Error: code parameter missing in response')

    // Close our webserver
    ref.close((err) => err.message ? console.log(err.message) : '')

    oauth2Client.getToken(req.query.code, function(err, tokens) {

      if(err) {
        return callback(err)
      }   

      // Store our tokens in memory for later use
      res.send('OK! You may close this window')

      callback(null, tokens)

    })

  })

  // Preserve reference to HTTP server
  ref = server.listen(8080, (err) => {

    if (err) return callback(err)

    console.log('Temporary server listening on port 8080 for OAuth callback')
    console.log('Visit the following url: ') 
    console.log(url)
  
  })
  
}

function init(err) {

  if (err) return console.log(err.message)

  let cmd = argv._[0]

  this[cmd](argv._.slice(1))

}

function commit() {


}

function add() {

}

function rm() {


}

function push() {

  

}

function fetch() {


}

function run() {

  GASServer.run()

}

function isValidFile(filename) {

  return !_ignoreFile.reduce(function(bool, pattern) {

    pattern = pattern.replace(/\*/g, '.*')

    let regex = new RegExp(pattern)

    return filename.match(regex) && bool

  }, false);

}

function getCurrentFiles() {


}

function isFileStored() {

}

function findConfig() {

  let config

  try {
    config = fs.readFileSync('./gapps/.gappsrc')
  } catch(e) {}

  return config

}

function storeToken_(path, tokens) {

  fs.writeFileSync(path, JSON.stringify(tokens))

}

function getToken_(path) {

  let token

  try {
   token = JSON.parse(fs.readFileSync(path))
  } catch(e) {}

  return token

}

function getProjectId_() {


}

function storeProjectId_(path, id) {

  // Get the file
  let data

  try {

    fs.readFileSync('./')

  } catch(e) {

    getProjectId

  }
  // Add the ID

}
