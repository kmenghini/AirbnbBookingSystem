const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');
var func = require('../helperFunctions.js');
var awsKey = require('../config/aws.config.js');

AWS.config.update({
  accessKeyId: awsKey.accessKeyId,
  secretAccessKey: awsKey.secretAccessKey,
  region: 'us-west-1'
});

const app = Consumer.create({
  queueUrl: 'https://sqs.us-west-1.amazonaws.com/462015734403/fromBookings',
  messageAttributeNames: ['book_time', 'listing_id'],
  handleMessage: (message, done) => {
    console.log('got message')
    func.receiveBookings(message.MessageAttributes.book_time.StringValue, message.MessageAttributes.listing_id.StringValue);
    done();
  },
  sqs: new AWS.SQS()
});

app.on('error', (err) => {
  console.log(err.message);
});

app.start();