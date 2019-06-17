/**
 * Yuuvis access library using got http requests.
 */
const got = require('got');
const request = require('request');

const yuuvisUrl = process.env.YUUVIS_URL || 'https://kolibri.enaioci.net'
const yuuvisTenant = process.env.YUUVIS_TENANT || 'kolibri'

const yuuvisAuthMethod = process.env.YUUVIS_AUTH_METHOD || 'BASIC';
const yuuvisAuthUser = process.env.YUUVIS_AUTH_USER;
const yuuvisAuthSecret = process.env.YUUVIS_AUTH_SECRET;

/**
 * Creates http headers for a request.
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

/**
 * Execute a sql query.
 * 
 * @param csql The yuuvis query.
 * 
 */
module.exports.query = async (csql, size) => {

  const searchUrl = yuuvisUrl + '/api/dms/objects/search';

  console.log("POST URL " + searchUrl + " with " + csql);
  console.log("POST headers " + JSON.stringify(createHeaders()));
  const { body } = await got.post(searchUrl, {
    headers: createHeaders(),
    body: JSON.stringify({
      query: {
        statement: csql,
        maxItems: size
      }
    })
  });
  return JSON.parse(body);
}

/**
 * Stream a content file.
 * 
 * @param objectId        The object id.
 * @param targetStream    The content is piped to this target stream.
 */
module.exports.content = async (objectId, targetStream) => {
  const contentUrl = yuuvisUrl + `/api/dms/objects/${objectId}/contents/file`;
  const responseStream = await got.get(contentUrl, {
    headers: createHeaders(),
    stream: true
  });
  responseStream.pipe(targetStream);
}

/**
 * Delete a object.
 * 
 * @param objectId        The object id.
 */
module.exports.deleteObject = async (objectId) => {
  const contentUrl = yuuvisUrl + `/api/dms/objects/${objectId}`;
  const responseStream = await got.delete(contentUrl, {
    headers: createHeaders()
  });
}

/**
 * Create an object.
 * 
 * @param objectType        The object id.
 */
module.exports.createObject = async (objectType, data) => {
  const createUrl = yuuvisUrl + `/api/dms/objects`;

  const object = {
    properties: {}
  }

  object.properties["enaio:objectTypeId"] = {
    "value": objectType
  }

  Object.keys(data).forEach(k => {
    object.properties[k] = {
      "value": data[k]
    }
  })

  const requestObj = {
    method: 'POST',
    uri: createUrl,
    headers: { ... { 'Content-Type': 'multipart/form-data' }, ...createHeaders() },
    formData: {
      data: {
        value: JSON.stringify({
          objects: [object]
        }),
        options: {
          contentType: 'application/json'
        }
      }
    }
  }


  new Promise((resolve, reject) => {
    request(requestObj, (error, res) => error ? reject(error) : resolve(res.body));
  }).then(
    res => {
      console.log(res)
    }, err => {
      console.log(err);
      throw(err);
    }
  )

}