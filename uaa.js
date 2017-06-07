'use strict';

const uaaClient = require('predix-uaa-client');

class UAA {
  /**
   * Create a new instance of the class that encapsulates the credentials.
   * We can then use this instance whenever needed without having to pass the
   * credentials all the time.
   *
   * Example:
   *
   *  const uaa = new UAA('https://36b12345-51eb-4b74-bef9-ea2f029fa7ee.predix-uaa.run.aws-usw02-pr.ice.predix.io/oauth/token', 'clientId', 'clientSecret');
   * @param {string} url URL to Predix UAA
   * @param {string} id ClientID
   * @param {string} secret ClientSecret
   */
  constructor(url, id, secret) {
    this.url = url;
    this.id = id;
    this.secret = secret;
  }

  /**
   * Returns a promise that, when fulfilled, returns a token. The access
   * token is token.access_token.
   *
   * @returns {promise} Promise that when fulfilled, returns a token object
   */
  getToken() {
    return uaaClient.getToken(this.url, this.id, this.secret);
  }
}

module.exports = UAA;