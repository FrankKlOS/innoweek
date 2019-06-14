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
    const carousel = {
      items: []
    }

    result.objects.forEach(o => {


      let title = o.properties['enaio:objectId'].value;
      let subTitle = 'subtitle';
      switch (objectType) {
        case 'tenKolibri:dokument': {
          title = o.properties['tenKolibri:clienttitle'].value;
          subTitle = o.properties['tenKolibri:clientdescription'].value;
          break
        }
        case 'email:email': {
          title = o.properties['email:subject'].value;
          subTitle = o.properties['email:from'].value;
          break
        }
      }

      messages.push({
        "card": {
          "title": title,
          "subtitle": subTitle,
          "imageUri": `https://yuuvisflow.now.sh/api/content.js?id=${o.properties['enaio:objectId'].value}`,
          "buttons": [
            {
              "text": "Open",
              "postback": `https://kolibri.enaioci.net/enaio/client/object/${o.properties['enaio:objectId'].value}`
            }
          ]
        }
      });


      carousel.items.push({
        "info": {
          "key": ""
        },
        "title": title,
        "description": subTitle,
        "image": {
          "imageUri": `https://yuuvisflow.now.sh/api/content.js?id=${o.properties['enaio:objectId'].value}`,
        }
      })



      /*messages.push({
          "basicCard": {
            "title": title,
            "subtitle": subTitle,
            "formattedText": title,
            "image": {
              "imageUri": `https://yuuvisflow.now.sh/api/content.js?id=${o.properties['enaio:objectId'].value}`,
              "accessibilityText": title
            },
            "buttons": [
              {
                "title": "Open",
                "openUriAction": {
                  "uri": `https://kolibri.enaioci.net/enaio/client/object/${o.properties['enaio:objectId'].value}`
                }
              }
            ]
          }
        })
      }
      */
    }) // forEach
    messages.push({"carouselSelect": carousel});

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
