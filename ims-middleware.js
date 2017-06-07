'use strict';

const genericMiddleware = require('./generic-middleware');
const defaultImsUrl = 'https://intelligent-mapping-prod.run.aws-usw02-pr.ice.predix.io';
const uaaUrlTail = '.predix-uaa.run.aws-usw02-pr.ice.predix.io/oauth/token';
const express = require('express');
const UAA = require('./uaa');

/**
 * Returns an express router that can be used to have access to all the endpoints
 * defined in IMS.
 *
 * Example
 * var props = {
 *  predixZoneId: '56e57707-cae0-4589-b62c-b222c462c1d3',
 *  subtenantId: '56e57707-cae0-4589-b62c-b222c462c1d3',
 *  clientId: 'enrique',
 *  clientSecret: 'enrique',
 *  uaaInstanceId: '36b8dd23-51eb-4b74-bef9-ea2f029fa7ee'
 * };
 *
 * app.use('/api', imsMiddleware(props));
 * // From now on, we have access to all the endpoints defined in IMS, using
 * // /api/v1/...
 *
 * @param {object} props Defines the properties to configure the middleware:
 * predixZoneId UUID
 * subtenantId string
 * clientId string, to use with UAA
 * clientSecret string, to use with UAA
 * uaaInstanceId UUID of the UAA instance in Predix US West
 * uaaUrl URL of the UAA instance to be used instead of uaaInstanceId (.../oauth/token)
 * imsUrl URL for IMS services; default value is Predix US West IMS services URL
 * @returns {router} A express router
 */
module.exports = function (props) {
  const router = express.Router();
  const headers = {
    'Predix-Zone-Id': props.predixZoneId,
    'x-subtenant-id': props.subtenantId,
    'content-type': 'application/json'
  };
  const uaa = new UAA(props.uaaUrl || `https://${props.uaaInstanceId}${uaaUrlTail}`,
    props.clientId, props.clientSecret);
  const middleware = genericMiddleware(uaa, headers, props.imsUrl || defaultImsUrl);

  // Add all the endpoints and methods to the router
  router.all('/*', middleware('/*'));

  return router;
};
