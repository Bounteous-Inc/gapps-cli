const GasServer = require('./GasServer.js')
const GoogleOAuth2 = require('./GoogleOAuth2.js')
const Config = require('./Config.js')
const fs = require('fs')

/**
 * @name Cli
 * @description
 * Interface for running GApps commands as passed in by user
 *
 * @arg argv command line args formatted via minimist
 */
function CliInterface(argv) {

  let client = GoogleOAuth.client().drive
  let fileId = Config.fileId.get()
  
  return {
    run: () => {
      // Load all .gs files, load on the fly w/ interpolation, run
      GasServer()
    },
    fetch: (callback) => {

      client
        .drive
        .get({
          fileId: fileId
        }, (err, files) => {

          console.log(files);          

        })

    },
    push: () => {

    }
  }

}

module.exports = CliInterface
