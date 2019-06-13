const got = require('got');

const yuuvisUrl = process.env.YUUVIS_URL || 'https://kolibri.enaioci.net'
const yuuvisTenant = process.env.YUUVIS_TENANT || 'kolibri'

const yuuvisAuthMethod = process.env.YUUVIS_AUTH_METHOD || 'BASIC';
const yuuvisAuthUser = process.env.YUUVIS_AUTH_USER;
const yuuvisAuthSecret = process.env.YUUVIS_AUTH_SECRET;

/**
 * Creates http headers for a request
 */
const createHeaders = () => {
  var headers = {
    'X-ID-Tenant-Name': yuuvisTenant,
    'Content-Type': 'application/json'
  }
  if (yuuvisAuthMethod == 'BASIC') {
    if (!yuuvisAuthUser) throw ("User not set for basic auth.");
    if (!yuuvisAuthSecret) throw ("Secret not set for basic auth.");
    headers['Authorization'] = 'Basic ' + Buffer.from(yuuvisAuthUser + ':' + yuuvisAuthSecret).toString('base64');
  } else if (yuuvisAuthMethod == 'OCP') {
    if (!yuuvisAuthSecret) throw ("Secret not set for OCP.");
    headers['Ocp-Apim-Subscription-Key'] = yuuvisAuthSecret;
  } else {
    throw ("Unsupported authentication method " + yuuvisAuthMethod);
  }
  return headers;
}

module.exports.query = async (csql) => {

  const searchUrl = yuuvisUrl + '/api/dms/objects/search';

  console.log("POST URL " + searchUrl + " with " + csql);
  console.log("POST headers " + JSON.stringify(createHeaders()));
  const { body } = await got.post(searchUrl, {
    headers: createHeaders(),
    body: JSON.stringify({
      query: {
        statement: csql
      }
    })
  });
  return JSON.parse(body);
}

module.exports.content = async (objectId, targetStream) => {
  const contentUrl = yuuvisUrl +  `/api/dms/objects/${objectId}/contents/file`;
  const responseStream = await got.get(contentUrl, {
    headers: createHeaders(),
    stream : true
  });
  responseStream.pipe( targetStream );
}