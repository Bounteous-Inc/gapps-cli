#!/usr/bin/env node
'use strict'
let argv = require('minimist')(process.argv.slice(2));

const google = require('googleapis')
const prompt = require('prompt')
const minimist = require('minimist')
const express = require('express')
const fs = require('fs')
const async = require('async')
const configFilePath = argv.config || __dirname + '.gappclisrc'
const Config = require('./lib/Config.js')(configFilePath)
const CliInterface = require('./lib/CliInterface.js')

// TODO let these be command line arg and save them
const clientId = '44544723576-4j6pi07nh525fo4q40nqav73svgditkd.apps.googleusercontent.com'
const clientSecret = 'tqrdbO1KOJbNf0o3eqXH3lc1'

// Check required configs
async.each(['fileId', 'clientId', 'clientSecret']
  .map(field => check_(field))
  .concat(checkToken), (err, result) => {

    if (err) return console.log(err.message)

    CliInterface(argv, Config)

  })

/**
 * @name checkToken
 * @description
 * Checks to see if a token property exists in the config
 *
 * @arg callback {function}
 */
function checkToken(callback) {
    
  if (Config.token.get()) return callback(null)

  // Token can be passed in as an argument
  if (argv.token) {

    Config.token.set({access_token: argv.token})
    return callback(null)

  }

  generateToken_(function(err, tokens) {

    if (err) return callback(err)

    Config.token.set(tokens)
    callback(null)

  })

}

/**
 * @name check_
 * @description
 * Factory that returns function for checking/setting required properties
 *
 * @arg name {string} name of configuration property
 * @returns {function} function to check property or request it
 */
function check_(name) {

  return function checkProp_(callback) {

    if (Config[name].get()) return callback(null)

    if (argv[name]) {

      Config[name].set(arg[name])
      return callback(null)

    }

    let promptProps = { properties: {} }

    promptProps[name] = {
      description: `What is the ${name} of the project?`
    }

    prompt.get(promptProps, (err, result) => {

      if (err) return callback(err)

      Config[name].set(result)
      callback(null)

    })

  }

}

/**
 * @name generateToken_
 * @description
 * Starts temporary webserver and prompts the user to complete OAuth flow
 *
 * @arg callback
 */
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
