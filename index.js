#!/usr/bin/env node
'use strict'
let argv = require('minimist')(process.argv.slice(2));

const google = require('googleapis')
const prompt = require('prompt')
const minimist = require('minimist')
const express = require('express')
const fs = require('fs')
const async = require('async')
const Config = require('./lib/Config.js')(configFilePath)
const CliInterface = require('./lib/CliInterface.js')
const GoogleAuth2 = require('./lib/GoogleOAuth2.js')

// TODO let these be command line arg and save them
const clientId = '44544723576-4j6pi07nh525fo4q40nqav73svgditkd.apps.googleusercontent.com'
const clientSecret = 'tqrdbO1KOJbNf0o3eqXH3lc1'

// Check required configs
async.each(['fileId', 'clientId', 'clientSecret']
  .map(field => check_(field))
  .concat(checkToken), (err, result) => {

    if (err) return console.log(err.message)

    CliInterface(argv)

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

  GoogleOAuth2.generateToken(function(err, tokens) {

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
