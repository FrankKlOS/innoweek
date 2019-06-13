const express = require('express');
//const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();
const yuuvis = require('../lib/yuuvis');

app.use(bodyParser.json());

//app.use(helmet());

const count = async (req, res) => {
  let objectType = req.body.queryResult.parameters.ObjectType;
  if (!objectType) {
    res.end(JSON.stringify({
      fulfillmentText: `I can't do that without an object type`
    }));
  } else {
    let result = await yuuvis.query("SELECT COUNT(*) FROM " + objectType);
    res.end(JSON.stringify({
      fulfillmentText: 'This magnificant bot says for ' + objectType + ' you have got ' + result.totalNumItems + ' objects.',
    }));
  }
}

const getObject = async (req, res) => {
  let objectType = req.body.queryResult.parameters.ObjectType;
  if (!objectType) {
    res.end(JSON.stringify({
      fulfillmentText: `I can't do that without an object type`
    }));
  } else {
    let result = await yuuvis.query("SELECT * FROM " + objectType);

    const messages = [];
    result.objects.forEach(o => {
      messages.push({
        "card": {
          "title": o.properties['email:subject'].value,
          "subtitle": o.properties['email:from'].value,
          "imageUri": "https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png",
          "buttons": [
            {
              "text": "Open",
              "postback": `https://kolibri.enaioci.net/enaio/client/object/${o.properties['enaio:objectId'].value}`
            }
          ]
        }
      });
      messages.push({
        "basicCard": {
          "title": o.properties['email:subject'].value,
          "subtitle": o.properties['email:from'].value,
          "image": {
            "imageUri": "https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png",
          },
          "buttons": [ 
            {
              "text": "Open",
              "postback": `https://kolibri.enaioci.net/enaio/client/object/${o.properties['enaio:objectId'].value}`
            }
          ]
        }
      })
    })

    res.end(JSON.stringify({
      fulfillmentText: 'Alright, Buddy',
      fulfillmentMessages: messages
    }));
  }
}




app.post('*', async (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200);
  console.log(JSON.stringify(req.body));
  let intent = req.body.queryResult.intent.displayName;
  try {

    switch (intent) {
      case 'GetObject': {
        getObject(req, res);
        break;
      }
      case 'Aggregation': {
        count(req, res);
        break;
      }
    }

  } catch (e) {
    console.log("Error " + e);
    next(e);
  }
});

module.exports = app;
