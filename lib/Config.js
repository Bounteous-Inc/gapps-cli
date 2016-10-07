/**
 * GApps CLI Config Constructor
 *
 * @description
 * Returns an object with setter/getters for the required token, fileId,
 * clientId, and clientSecret configurations. When a field is set, it will be 
 * written to the .gappsclirc JSON file at the configFilePath passed to the
 * constructor.
 *
 * @arg configFilePath {string} path to config file
 * @returns {object} Config
 */
module.exports = config;

/**
 * @name config
 * @description
 * Returns the config object w/ setters and getters
 *
 * @arg configFilePath {string} path to store/retrieve config file from
 */
function config(configFilePath) {

  const defaultFields = ['token', 'fileId', 'clientId', 'clientSecret']
  let file = {}

  try {
    file = fs.readFileSync(configFilePath)
  } catch (e) {}

  return defaultFields
    .reduce((obj, field) => {
      obj[field] = setterGetterFactory_(field, file, configFilePath)
      return obj
    }, {})
 
}

/**
 * @name setterGetterFactory_
 * @private
 * @description 
 * Creates set/get functions on the config.store object at config.name
 *  
 *
 * @arg config {object}
 *   @prop store {object} object to get/set values on
 *   @prop name {string} name of property to get/set properties on store
 *   @prop path {string} optional path to sync object to as JSON
 *
 * @returns {object} get/set functions for key at store
 */
function setterGetterFactory_(config) {

  validate_('config', config)
  
  ['name', 'store']
    .forEach(prop => validate_(prop, config[prop]))

  return {
    set: val => {
      config.store[config.name] = val
      if (path) {
        fs.writeFileSync(config.path, JSON.stringify(config.store))
      }
    },
    get: () => (config.store[config.name])
  }
}

/**
 * Simple validator
 */
function validate_(name, arg) {
  if (typeof arg === 'undefined') {
    throw new TypeError(`Missing argument ${name}`) 
  }
}
