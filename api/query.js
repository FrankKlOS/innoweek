const express = require('express');
//const helmet = require('helmet');
const bodyParser = require('body-parser');
const got = require('got');
const app = express();

app.use(bodyParser.json());

//app.use(helmet());

const yuuvisUrl = process.env.YUUVIS_URL || 'https://kolibri.enaioci.net'
const yuuvisTenant = process.env.YUUVIS_TENANT || 'kolibri'

const yuuvisAuthMethod = process.env.YUUVIS_AUTH_METHOD || 'BASIC';
const yuuvisAuthUser = process.env.YUUVIS_AUTH_USER;
const yuuvisAuthSecret = process.env.YUUVIS_AUTH_SECRET;

/**
 * Creates http headers for a request
 */
const createHeaders=()=>{
  var headers = {
    'X-ID-Tenant-Name' : yuuvisTenant,
    'Content-Type' : 'application/json'
  }
  if( yuuvisAuthMethod=='BASIC' ) {
    if( !yuuvisAuthUser ) throw("User not set for basic auth.");
    if( !yuuvisAuthSecret ) throw("Secret not set for basic auth.");
    headers['Authorization'] = 'Basic '+ Buffer.from( yuuvisAuthUser +':'+ yuuvisAuthSecret ).toString('base64') ;
  } else if( yuuvisAuthMethod=='OCP' ) {
    if( !yuuvisAuthSecret ) throw("Secret not set for OCP.");
    headers['Ocp-Apim-Subscription-Key'] = yuuvisAuthSecret;
  } else {
    throw("Unsupported authentication method "+yuuvisAuthMethod);
  }
  return headers;
}

const yuuvisQuery = async (csql) => {
  
  const searchUrl = yuuvisUrl + '/api/dms/objects/search';

  console.log("POST URL "+searchUrl+" with "+csql);
  console.log("POST headers "+JSON.stringify(createHeaders() ));
  const {body} = await got.post( searchUrl, {
    headers : createHeaders(),
    body : JSON.stringify({
      query : {
        statement : csql
      }
    })
  });
  return JSON.parse(body);
}

app.post('*', async (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200);
  console.log(JSON.stringify(req.body));
  let objectType = req.body.queryResult.parameters.ObjectType;
  try {
    let result = await yuuvisQuery("SELECT COUNT(*) FROM "+objectType);

    console.log(JSON.stringify(result));

    res.end(JSON.stringify({
      //fulfillmentText : 'Manuel hat Recht',
      fulfillmentText : 'This magnificant bot says for '+objectType+' you have got '+result.totalNumItems+' objects.',
      requestMirror : JSON.stringify(req.body),
      env: process.env
    }));
  } catch(e) {
    console.log("Error "+e);
    next(e);
  }
});

module.exports = app;
