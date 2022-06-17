const { assert } = require('chai');
const { it } = require('mocha');

const { lookup, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL : "http://www.lighthouselabs.ca",
    userID : "IIII"},
  "9sm5xK": {
    longURL :"http://www.google.com",
    userID : "IIII"},
  "######": {
    longURL : "http://www.lituselabs.ca",
    userID : "userRandomID"},
  "98m5xK": {
    longURL :"http://www.goo.com",
    userID : "IIII"
  }
};

describe('lookup', function() {
  it('should return user object', function() {
    const user = lookup(testUsers, "user@example.com");
    const expectedEvaulation = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.equal(user.id, expectedEvaulation.id);
    assert.equal(user.email, expectedEvaulation.email);
    assert.equal(user.password, expectedEvaulation.password);
  });

  it('should return false when email not found', function() {
    const user = lookup(testUsers, "user@test.com");
    const expectedEvaulation = false;
    assert.equal(user, expectedEvaulation);
  });
});

describe('urlsForUser', function() {
  it('should return urls of specific user', function() {
    const urls = urlsForUser("userRandomID", urlDatabase);
    const expectedEvaulation = "http://www.lituselabs.ca";
    assert.equal(urls['######'].longURL, expectedEvaulation);
  });
});