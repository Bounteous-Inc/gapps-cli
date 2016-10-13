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
 
  initilizeGit(Config.fileId.get(), (err) => {

    if (err) return console.log(err);
 
    return {
      run: () => {

        // Load all .gs files, load on the fly w/ interpolation, run
        GasServer()

      },
      fetch: (callback) => {

      },
      push: () => {

      },
      merge: () => {

      },
      pull: () => {

      },
      commit: () => {

      }
    }

  });

}

function initializeGit(fileId) {

  drive
    .files
    .list({
      q: 'name="' + fileId + '.bundle"'
    }, (err, results) {

      if (err) return callback (err)

      let file = results.files[0];
     
      if (!file) return bootstrapRepo(); 

      async
        .waterfall([
          bundleGetterFactory(file.id),
          unpackBundle,
        ])

    })

}

function bundleGetterFactory(fileId) {

  return function(callback) {
    drive.
      get({id: fileId}, (err, repo) => {

        let filePath = '.' + fileId + '.bundle';
        let tempFolderPath = '.temp-' + fileId;

        fs.writeFileSync(repo, filePath);

        try {
          fs.makeDirSync(tempFolderPath);
        } catch (e) {}
  
        // Place bundle into temp folder
        spawnSync('git clone ' + filePath + ' ' + tempFolderPath);

      }) 

}

module.exports = CliInterface
