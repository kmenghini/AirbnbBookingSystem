require('newrelic');

'use strict';

const bodyParser = require('body-parser');
var cassandra = require('cassandra-driver');
const express = require('express');
const moment = require('moment');
var cron = require('node-cron');

//file requirements
var dbCassandra = require('./db/cassandra/index.js');
var dbPostgres = require('./db/postgres/index.js');
var func = require('./helperFunctions.js');

//uncomment this to start pulling from SQS
// var sqsConsumer = require('./sqs/sqsConsumer.js');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send('Hello world\n');
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

/*uncomment to create more data
create fake data to txt files, argument is number of users
var dataGen = require('./db/dataGen.js')
dataGen.createUsers(1000000);
*/

/*uncomment to parse listings table data for listings_by_host table
var listingsByHostFile = require('./db/generateListingsByHost.js');
var fileNum = 1; //1 to 20
listingsByHostFile.generate(fileNum);
*/

//uncomment to load bookings csv into bookings table and counter tables
// var bookingsToCass = require('./db/loadBookingsToCassandra.js');
// bookingsToCass.loadBookings(1);

//to test timing of any function, wrap with this:
// var startTime = moment().valueOf();
// var endTime = moment().valueOf();
// console.log('time to increment hosts count:', (endTime - startTime), 'ms');


//queries cassandradb to get listing details by listingId
app.get('/inventory/:listingId', (req, res) => {
  // var startTime = moment().valueOf();
  dbCassandra.getListingDetails(req.params.listingId, (err, data) => {
    // console.log('got from cassandra')
    if (data) {
      res.status(200).json(data[0]);
    } else {
      res.status(404).send(err)
    }
  });
  // dbPostgres.getPopularListingDetails(req.params.listingId, (err, data) => {
  //   if (err) {
  //     console.log('error!', err);
  //   } else {
  //     if (data.length > 0) {
  //       console.log('got from postgres')
  //       data[0].from = 'postgres'
        
  //       res.status(200).json(data[0]);
  //       return;
  //     }
  //   }
  // })
});


//in a cron job to check for new superhosts twice a day
cron.schedule('00 2,14 * * *', func.processNewSuperhosts);

//in cron job to get top listings twice a day
cron.schedule('30 2,14 * * *', func.processTopListings);



var sum = (a, b) => {
  return a + b;
}
module.exports.sum = sum;