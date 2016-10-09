'use strict'

const GasServer = require('./GasServer.js')
const GoogleOAuth2 = require('./GoogleOAuth2.js')
const Config = require('./Config.js')
const fs = require('fs')
const spawnSync = require('child_proocess').spawnSync
const drive = GoogleOAuth.driveApiClient()
const fileId = Config.fileId.get()

/**
 * @name Cli
 * @description
 * Interface for running GApps commands as passed in by user
 *
 * @arg argv command line args formatted via minimist
 */
function CliInterface(argv) {
  
  return {
    run: () => {
      // Load all .gs files, load on the fly w/ interpolation, run
      GasServer()
    },
    fetch: (callback) => {

      drive
        .files
        .list({
          q: '=' + fileId + '.bundle'
        }, (err, results) {

          if (err) return callback (err)
          
          async 
            .waterfall([
              bundleGetterFactory(results),
              unpackBundle,
              runGitCommand,
            ])

        })

    },
    push: () => {

      

    }
  }

}

function bundleGetterFactory(bundle) {

  drive.
    get(bundle, (err, bundle) {

      // Place bundle into temp folder
      // Unpack it

    }) 

}

module.exports = CliInterface
