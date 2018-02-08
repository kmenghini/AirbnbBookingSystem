const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');
const server = require('../app.js');
var awsKey = require('../config/aws.config.js');

AWS.config.update({
  accessKeyId: awsKey.accessKeyId,
  secretAccessKey: awsKey.secretAccessKey,
  region: 'us-west-1'
});

const app = Consumer.create({
  queueUrl: 'https://sqs.us-west-1.amazonaws.com/462015734403/fromBookings',
  handleMessage: (message, done) => {
    console.log('got message')
    var booking = JSON.parse(message.Body);
    console.log(booking);
    server.receiveBookings(booking);
    done();
  },
  sqs: new AWS.SQS()
});

app.on('error', (err) => {
  console.log(err.message);
});

app.start();