import { IamAuthenticator } from 'ibm-watson/auth';

const fs = require('fs');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

function testNLP(){
  console.log("testing Watson API:")
  const nlu = new NaturalLanguageUnderstandingV1({
    authenticator: new IamAuthenticator({ apikey: 'CgNIbRG8SxkoCqqbiDNIbt-DsA4uKCsNHT2ZFqnAb2JY' }),
    version: '2018-04-05',
    url: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/5de9211d-d47c-46d9-ba40-c51d98fcb351'
  });
  
  nlu.analyze(
    {
      html: 'This is a test sentence', // Buffer or String
      features: {
        concepts: {},
        keywords: {}
      }
    })
    .then(response => {
      console.log(JSON.stringify(response.result, null, 2));
    })
    .catch(err => {
      console.log('error: ', err);
    });
}
