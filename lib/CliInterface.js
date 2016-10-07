const GasServer = require('./GasServer.js')

/**
 * @name CliInterface
 * @description
 * Runs CLI commands as passed in by user
 *
 * @arg argv command line args formatted via minimist
 * @arg Config configuration object created by Config constructor
 */
function CliInterface(argv, Config) {

  return {
    run: () => {
      GasServer()
    },
    fetch: () => {

    },
    push: () => {

    }
  }

}

module.exports = CliInterface
