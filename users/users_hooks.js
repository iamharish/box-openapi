/**
 * Created by hgokavarapu on 5/16/17.
 */
const hooks = require('hooks');
const util = require('util');
const caseless = require('caseless');
const passwordgrant = require('./../passwordgrant.js');

var accessToken = null;

//Get access token before all tests
hooks.beforeAll(function (transactions, done) {
  hooks.log('before all');
  passwordgrant.getAccessToken('./users/users.properties', function (token) {
      hooks.log("accessToken: "+token);
      accessToken = token;
      done();
  });
});

// Before each test let's fix the media type - unfortunately current support
// of Swagger in Dredd works only for application/json as of now
hooks.beforeEach((transaction, done) => {
  hooks.log('before each');
  if (transaction.fullPath.indexOf("2.0/users") == -1) {
      transaction.skip = true;
  }
  let contentType;
  transaction.request.headers['Authorization'] = 'Bearer '+accessToken;
  if (transaction.expected.statusCode == '204') {
    transaction.request.headers['Accept'] = 'text/plain';
    delete transaction.expected.headers['Content-Type'];
  }
  done();
});

var responseStash = {};

hooks.after("Users > /2.0/users > Create User > 201 > application/json", function (transaction, done) {
  hooks.log("Create request");
  transaction.skip = false;
  responseStash[transaction.name] = transaction.real;
  hooks.log("create user response:"+util.inspect(responseStash['Users > /2.0/users > Create User > 201 > application/json'].body, false, null));
  var createResponseBody = responseStash['Users > /2.0/users > Create User > 201 > application/json'].body;
  done();
});

hooks.before("Users > /2.0/users/{USER_ID} > Update User, Change User's Login > 200 > application/json", function (transaction, done) {
  hooks.log("Delete Request");
  transaction.skip = false;
  var createResponseBody = responseStash['Users > /2.0/users > Create User > 201 > application/json'].body;
  hooks.log(util.inspect(createResponseBody, false, null));
  var userId = JSON.parse(createResponseBody)['id'];
  hooks.log("userId for put: "+userId);
  //replacing id in URL with stashed id from previous response
  var url = transaction.fullPath;
  transaction.fullPath = url.replace('USER_ID', userId);
  done();
});


hooks.before("Users > /2.0/users/{USER_ID} > Update User, Change User's Login > 200 > application/json", function (transaction, done) {
  hooks.log("Delete Request");
  transaction.skip = false;
  var createResponseBody = responseStash['Users > /2.0/users > Create User > 201 > application/json'].body;
  hooks.log(util.inspect(createResponseBody, false, null));
  var userId = JSON.parse(createResponseBody)['id'];
  hooks.log("userId for put: "+userId);
  //replacing id in URL with stashed id from previous response
  var url = transaction.fullPath;
  transaction.fullPath = url.replace('USER_ID', userId);
  done();
});

hooks.before("Users > /2.0/users/{USER_ID} > Delete User > 204 > application/json", function (transaction) {
  hooks.log("Delete Request");
  transaction.skip = false;
  var createResponseBody = responseStash['Users > /2.0/users > Create User > 201 > application/json'].body;
  hooks.log(util.inspect(createResponseBody, false, null));
  var userId = JSON.parse(createResponseBody)['id'];
  hooks.log("userId for delete: "+userId);
  //replacing id in URL with stashed id from previous response
  var url = transaction.fullPath;
  transaction.fullPath = url.replace('USER_ID', userId);
});

hooks.afterEach((transaction, done) => {
  hooks.log("after each");
  if (transaction.skip == false) {
    var headers = caseless(transaction.test.request.headers);
    var name = headers.has('Authorization');
    headers[name] = 'Bearer *****';
    transaction.test.request.headers = headers;
  }
  done();
});