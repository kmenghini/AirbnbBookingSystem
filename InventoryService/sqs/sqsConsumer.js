const Consumer = require('sqs-consumer');
const server = require('../app.js');

const app = Consumer.create({
 queueUrl: 'https://sqs.us-west-1.amazonaws.com/462015734403/fromBooking',
 handleMessage: (message, done) => {
   // do some work with `message`
   //server.receiveBookings(message);
   done();
 }
});

app.on('error', (err) => {
 console.log(err.message);
});

app.start();