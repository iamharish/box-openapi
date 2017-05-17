/**
 * Created by hgokavarapu on 5/16/17.
 */
const hooks = require('hooks');
const util = require('util');

// Before each test let's fix the media type - unfortunately current support
// of Swagger in Dredd works only for application/json as of now
hooks.beforeEach((transaction, done) => {
  let contentType;
  transaction.request.headers['Authorization'] = 'Bearer UZzvsjQ24gEGUK3db9l8vpDTS2rFjdgq';
  if (transaction.expected.statusCode == '204') {
    transaction.request.headers['Accept'] = 'text/plain';
    delete transaction.expected.headers['Content-Type'];
  }
  done();
});

var responseStash = {};

hooks.after("Users > /2.0/users > Create User > 201 > application/json", function (transaction) {
  hooks.log("Create request");
  responseStash[transaction.name] = transaction.real;
});

hooks.before("Users > /2.0/users/{USER_ID} > Delete User > 204 > application/json", function (transaction) {
  hooks.log("Delete Request");
  hooks.log("create user response:"+util.inspect(responseStash['Users > /2.0/users > Create User > 201 > application/json'].body, false, null));
  var createResponseBody = responseStash['Users > /2.0/users > Create User > 201 > application/json'].body;
  hooks.log(util.inspect(createResponseBody, false, null));
  var userId = JSON.parse(createResponseBody)['id'];
  //replacing id in URL with stashed id from previous response
  var url = transaction.fullPath;
  transaction.fullPath = url.replace('1684392715', userId);
});