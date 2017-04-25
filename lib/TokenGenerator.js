/**
 * Token Generator
 *
 * @description
 * Returns an Auth client configured for use with Drive
 *
 * @returns {object} object with methods and properties for Google OAuth
 */
const express = require('express')
const google = require('googleapis')

/**
 * @name generateTokens
 * @description
 * Starts temporary webserver and prompts the user to complete OAuth flow
 *
 * @arg callback
 */
function generateTokens(config, callback) {

  const OAuth2 = google.auth.OAuth2;
  const redirectUri = 'http://localhost:8080/redirect';
  const client = new OAuth2(config.clientId, config.clientSecret, redirectUri);

  let url = client.generateAuthUrl({
    access_type: 'offline',
    scope: config.scope
  });
  let server = express();
  let ref;

  // Start a temporary webserver for negotiating OAuth handshake
  server.get('/redirect', (req, res) => {

    if(!req.query.code) return console.error('Error: code parameter missing in response')

    // Close our webserver
    ref.close((err) => err ? console.log(err.message) : '');

    client.getToken(req.query.code, function(err, tokens) {

      if(err) return callback(err);

      // Store our tokens in memory for later use
      res.send('OK! You may close this window');

      callback(null, tokens);

    });

  });

  // Preserve reference to server so we can call .close() later
  ref = server.listen(8080, (err) => {

    if (err) return callback(err)

    console.log('Temporary server listening on port 8080 for OAuth callback')
    console.log('Visit the following url: ') 
    console.log(url)
  
  })
  
}

module.exports = generateTokens;