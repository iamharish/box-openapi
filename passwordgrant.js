const request = require('request');
const ini = require('ini')
const fs = require('fs');
const util = require('util');
var file = 'users.properties';
const formData = {
  grant_type: 'password',
  username: '',
  password: '',
  client_id: '',
  client_secret: ''
};
const preamble = '# The config.properties file should never be added to\n' +
  '# source control since it may contain sensitive information. \n\n' +
  '# Set an auth token for a test account here in order to run integration tests.\n\n'

//  see if a config.properties file is specified
if (process.argv.length > 2) {
  file = process.argv[2];
}

function updateConfigFile(accessToken, refreshToken) {
    console.log('Updating config file');
    var textLines = (fs.readFileSync(file, 'utf-8')).split("\n");
    textLines.forEach(function(entry, i) {
    if (/accessToken=/.test(entry)) {
        textLines[i] = "accessToken=" + accessToken;
    }
    if (/refreshToken=/.test(entry)) {
        textLines[i] = "refreshToken=" + refreshToken;
    }});
    fs.writeFileSync(file, textLines.join("\n"));
};

module.exports = {
  getAccessToken: function (configFile, callback) {
    file = configFile;
    console.log('Reading config file: ' + file);
    var config = ini.parse(fs.readFileSync(file, 'utf-8'));
    console.log('config: ' + util.inspect(config));
    formData.client_id = config.clientID;
    formData.client_secret = config.clientSecret;
    formData.username = config.userName;
    formData.password = config.password;
    request.post({
        url: 'https://api.box.com/oauth2/token',
        form: formData
      },

      function(error, response, body) {
        console.log('Updating config file');
        if (error) {
          console.log(error);
        } else {
          console.log(response.statusCode);
          var parsed = JSON.parse(body);
          config.accessToken = parsed['access_token'];
          config.refreshToken = parsed['refresh_token'];
          console.log('New access token: '+config.accessToken);
          updateConfigFile(config.accessToken, config.refreshToken);
          callback(config.accessToken);
        }
    });
  }
};