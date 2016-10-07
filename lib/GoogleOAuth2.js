/**
 * Google Auth Client
 *
 * @description
 * Returns an Auth client configured for use with Drive
 *
 * @returns {object} object with methods and properties for Google OAuth
 */
const express = require('express')
const Config = require('./Config.js')
const googleapis = require('googleapis')

let scope = ['drive', 'drive.file'].map((name) => 'https://www.googleapis.com/auth/' + name)

module.exports = {
  client: client,
  generateTokens: generateTokens,
  scope: scope  
}

/**
 * @name client
 * @description
 * Returns a client configured for use with Google Drive. Authenticates, if
 * Config.tokens.get() returns a value
 *
 * @returns {object} Authorized or Unauthorized Google OAuth Client
 */
function client() {

  let OAuth2 = google.auth.OAuth2
  let redirectUri = 'http://localhost:8080/redirect'
  let oauth2Client = new OAuth2(Config.clientId, Config.clientSecret, redirectUri)

  if (Config.tokens.get()) {
  
    oauth2CLient.setCredentials(Config.tokens.get())

  }

  return oauth2Client;

}

/**
 * @name generateTokens
 * @description
 * Starts temporary webserver and prompts the user to complete OAuth flow
 *
 * @arg callback
 */
function generateTokens(callback) {

  let oAuth2Client = client()
  let url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GoogleOauthClient.scope
  })
  let server = express()
  let ref

  // Start a temporary webserver for negotiating OAuth handshake
  server.get('/redirect', (req, res) => {

    if(!req.query.code) return console.error('Error: code parameter missing in response')

    // Close our webserver
    ref.close((err) => err ? console.log(err.message) : '')

    oauth2Client.getToken(req.query.code, function(err, tokens) {

      if(err) {
        return callback(err)
      }   

      // Store our tokens in memory for later use
      res.send('OK! You may close this window')

      callback(null, tokens)

    })

  })

  // Preserve reference to server so we can call .close() later
  ref = server.listen(8080, (err) => {

    if (err) return callback(err)

    console.log('Temporary server listening on port 8080 for OAuth callback')
    console.log('Visit the following url: ') 
    console.log(url)
  
  })
  
}
