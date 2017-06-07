'use strict';

var Promise = require('bluebird');
const request = Promise.promisify(require('request'));

/**
 * Class to access IMS services via generators.
 *
 * Generic errors that can be thrown when using this class:
 * - Error getting token: 401
 *   Indicates bad client id or secret in the UAA provided
 * - Invalid URI "%s"
 *   Indicates the url stored in the UAA provided (%s) is not accessible or correct
 *
 * All of the functions are generators, returning an object with two properties:
 * - statusCode
 * - body
 *
 * Non UAA related errors can be checked using the statusCode. For example:
 * - 403
 *   UAA not authorised to access that instance of IMS, or
 *   The UAA provided hasn't got access to this zoneId
 * - 400
 *   Validation error (wrong zoneId format, or bad body...)
 *
 */
class IMS {
  /**
   * Returns an instance of the IMS class
   *
   * @param uaa {UAA} Instance of UAA class. It encapsulates the client Id/secret/URL
   * @param predixZoneId {String} Should be a UUID
   * @param subtenantId {String} Any string that identifies a subtenant
   * @param imsUrl {String} If none specified, it uses https://intelligent-mapping-prod.run.aws-usw02-pr.ice.predix.io
   * @param request {Object} request object in case we need to inject a different one to the promisified standard request
   */
  constructor(uaa, predixZoneId, subtenantId, imsUrl, myRequest) {
    this.uaa = uaa;
    this.predixZoneId = predixZoneId;
    this.subtenantId = subtenantId;
    this.imsUrl = imsUrl || 'https://intelligent-mapping-prod.run.aws-usw02-pr.ice.predix.io';
    this.request = myRequest || request;
  }

  /**
   * Returns a list of all the collections stored
   *
   * @returns {Object} Object with two properties: statusCode (integer) and body (object/string)
   */
  *getCollections() {
    return yield *this.get('collections');
  }

  /**
   * Returns the named collection
   *
   * @param collName {String} Collection Name
   * @returns {Object} Object with two properties: statusCode (integer) and body (object)
   */
  *getCollection(collName) {
    return yield *this.get(`collections/${collName}`);
  }

  /**
   * Adds a new collection called collName
   *
   * @param collName {String} Collection name
   * @param body {Object} GeoJSON representing the collection
   * @returns {Object} Object with two properties: statusCode (integer) and body (object)
   */
  *postCollection(collName, body) {
    return yield *this.post(`collections/${collName}`, body);
  }

  /**
   * Returns the result of querying the services spatially
   *
   * @param collName {String} Collection name
   * @param operator {String} nearest | within
   * @param body {Object} JSON describing the spatial query operation
   * @returns {Object} Object with two properties: statusCode (integer) and body (object)
   */
  *spatialQuery(collName, operator, body) {
    return yield *this.post(`collections/${collName}/spatial-query?operator=${operator}`, body);
  }

  /**
   * Returns zero, one or more features with the Id provided
   *
   * @param collName {String} Collection Name
   * @param featureId {String} The feature Id
   * @returns {Object} Object with two properties: statusCode (integer) and body (object)
   */
  *getFeatures(collName, featureId) {
    return yield *this.get(`collections/${collName}/features?id=${featureId}`);
  }

  /**
   * Update zero, one or more features with the Id provided
   *
   * @param collName {String} Collection Name
   * @param featureId {String} The feature Id
   * @param body {Object} JSON representing the new value of the feature
   * @returns {Object} Object with two properties: statusCode (integer) and body (object)
   */
  *updateFeatures(collName, featureId, body) {
    return yield *this.put(`collections/${collName}/features?id=${featureId}`, body);
  }
  /**
   * Performs a GET operation on URI
   *
   * @param uri {String} URI to call
   * @returns {Object} Object with two properties: statusCode (integer) and body (object)
   */
  *get(uri) {
    return yield *this.makeRequest(uri, 'GET');
  }

  /**
   * Performs a POST operation on URI with the body provided
   *
   * @param uri {String} URI to call
   * @param body {Object} JSON for the body
   * @returns {Object} Object with two properties: statusCode (integer) and body (object)
   */
  *post(uri, body) {
    return yield *this.makeRequest(uri, 'POST', body);
  }

  /**
   * Performs a PUT operation on URI with the body provided
   *
   * @param uri {String} URI to call
   * @param body {Object} JSON for the body
   * @returns {Object} Object with two properties: statusCode (integer) and body (object)
   */
  *put(uri, body) {
    return yield *this.makeRequest(uri, 'PUT', body);
  }

  /**
   * Makes the request to URI endpoint, using method and with specified body.
   * Can raise an exception if there are problems with the UAA token.
   * Otherwise, any errors are controlled by the statusCode and body of the response
   *
   * @param uri {String} URI to call
   * @param method {String} Method to use for the call
   * @param body {Object} JSON for the body
   * @returns {Object} Object with two properties: statusCode (integer) and body (object)
   */
  *makeRequest(uri, method, body) {
    const token = yield this.uaa.getToken();
    const response = yield this.request(`${this.imsUrl}/v1/${uri}`, {
      method,
      body,
      json: true,
      headers: {
        'authorization': `Bearer ${token.access_token}`,
        'x-subtenant-id': this.subtenantId,
        'predix-zone-id': this.predixZoneId
      }
    });
    return {
      statusCode: response.statusCode,
      body: response.body
    };
  }
}
module.exports = IMS;