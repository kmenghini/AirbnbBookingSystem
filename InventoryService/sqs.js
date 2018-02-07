var AWS = require('aws-sdk');
var awsKey = require('./config/aws.config.js');

// var config = new AWS.Config({
//   accessKeyId: awsconfig.accessKeyId,
//   secretAccessKey: awsconfig.secretAccessKey
// });

AWS.config.update({
  accessKeyId: awsKey.accessKeyId,
  secretAccessKey: awsKey.secretAccessKey,
  region: 'us-west-2'
});

//endpoint
//sqs.us-west-2.amazonaws.com

const QUEUE_URL = 'https://sqs.us-west-2.amazonaws.com/462015734403/fromBookings.fifo';


var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var params = {
  QueueNamePrefix: 'fromBookings.fifo',
  // Attributes: {
  //   'DelaySeconds': '60',
  //   'MessageRetentionPeriod': '86400'
  // }
};

sqs.listQueues(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
  }
});

//get messages from Bookings and add to queue
//sqs.sendMessageBatch()

//take messages from queue and processBooking in app
//sqs.receiveMessage()

