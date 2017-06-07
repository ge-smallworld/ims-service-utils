'use strict';

const requestProxy = require('express-request-proxy');
/**
 * The purpose of this module is to reverse proxy one or more endpoints.
 * It does that by returning a function that can be used to configure one or
 * more URIs for which any requests will be forwarded to another endpoint.
 * The output can then be used as a middleware in express.js
 *
 * Example:
 * const genericMiddleware = require('generic-middleware');
 * const headers = {
 *   'Predix-Zone-Id': '....',
 *   'X-Subtenant-Id': '....',
 *   'Content-Type': 'application/json'
 * }
 * const middleware = genericMiddleware(uaa, headers, 'https://intelligent-mapping-prod...predix.io');
 * const imsRouter = express.Router();
 *
 * // The following adds all of the endpoints defined in IMS
 * imsRouter.all('/v1/*', middleware('/v1/*');
 * app.use('/api', imsRouter);
 * // From this point onwards, calling /api/v1/collections (and other endpoints) will
 * // be forwarded to https://intelligent-mapping-prod...predix.io/v1/collections
 *
 * // The following adds only the GET endpoints
 * imsRouter.get('/v1/*', middleware('/v1/*');
 *
 * @param {UAA} uaa Instance of UAA class, or an object that responds to getToken()
 * and returns a promise when fulfilled.
 * @param {object} additionalHeaders Any headers to be sent out when the request is
 * forwarded
 * @param {string} url Where to forward the requests to
 * @returns {Function} A function that returns another function that returns
 * a middleware that can be used in express.js
 */
module.exports = function (uaa, additionalHeaders, url) {
  return function (uri) {
    return function (req, res, next) {
      uaa.getToken().then(token => {
        let headers = {};
        Object.assign(headers, additionalHeaders);
        headers['Authorization'] = `Bearer ${token.access_token}`;
        requestProxy({
          url: `${url}${uri}`,
          headers: headers
        })(req, res, next);
      });
    };
  };
};
