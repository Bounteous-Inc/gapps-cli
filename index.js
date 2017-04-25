#!/usr/bin/env node
// THIS WON'T WORK WITH "bound" FILES 
'use strict'
let argv = require('minimist')(process.argv.slice(2));

const google = require('googleapis')
const fs = require('fs')
const CLI = require('./lib/Cli.js')
const homedir = require('os').homedir();
const generateToken = require('./lib/TokenGenerator.js');
const configPath = homedir + '/.gappscli/config.json';
const tokenPath = homedir + '/.gappscli/token.json';

let scope = ['drive', 'drive.file', 'drive.scripts'].map((name) => 'https://www.googleapis.com/auth/' + name)
let localConfig;
let config;
let tokens;

try {

  config = require(configPath);
  config.scope = scope;

} catch(e) {

  console.error(`Please configure your config.json in ${configPath}`);
  
}

try {

  tokens = require(tokenPath);

} catch(e) {

  generateToken(config, function(err, tokens) {

    fs.writeFileSync(tokenPath, JSON.stringify(tokens));
    return init(tokens);

  });

}

if (tokens) init(tokens);


function init(tokens) {

  let OAuth2 = google.auth.OAuth2;
  let redirectUri = 'http://localhost:8080/redirect';
  let client = new OAuth2(config.clientId, config.clientSecret, redirectUri);

  client.setCredentials(tokens);
  
  CLI(argv, google.drive({
    'version': 'v3',
    'auth': client
  }));

}
