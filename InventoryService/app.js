'use strict';

const bodyParser = require('body-parser');
var cassandra = require('cassandra-driver');
const express = require('express');
// var models = require('express-cassandra');
const moment = require('moment');
var dbCassandra = require('./db/cassandra/index.js');
var dbPostgres = require('./db/postgres/index.js');

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

//uncomment to create more data
//create fake data to txt files, argument is number of users
//var dataGen = require('./db/dataGen.js')
//dataGen.createUsers(1000000);

//uncomment to parse listings table data for listings_by_host table
//var listingsByHostFile = require('./db/generateListingsByHost.js');
//var fileNum = 1; //1 to 20
//listingsByHostFile.generate(fileNum);

//queries cassandradb to get listing details by listingId
app.get('/inventory/:listingId', (req, res) => {
  var listingId = req.params.listingId;
  var startTime = moment().valueOf();
  dbCassandra.getListingDetails(listingId, (data) => {
    res.status(200).json(data[0]);    
    var endTime = moment().valueOf();
    console.log('time for get request for listing details:', (endTime - startTime), 'ms');
  });
});

//queries cassandra db to get hostId by listingId
var getHostId = (listingId, callback) => {
  var startTime = moment().valueOf();
  dbCassandra.getHostIdOfListing(listingId, (data) => {
    var result = (data[0].hostid).toString();
    var endTime = moment().valueOf();
    console.log('time to find hostId:', (endTime - startTime), 'ms');
    callback(result);
  });
}
// getHostId('ea6375d2-51b0-4bca-b6a7-a9a73a98a053', data => console.log('getHostId', data));

//increments listings count by listingId
var incListingsCount = (listingId) => {
  var startTime = moment().valueOf();
  dbPostgres.incrementListingsCount(listingId, (err, data) => {
    if (err) {
      console.log('error! ' + err);
    } else {
      console.log('listing insert successful!');
    }
    var endTime = moment().valueOf();
    console.log('time to increment listings count:', (endTime - startTime), 'ms');
  })
}
// incListingsCount('ea6375d2-51b0-4bca-b6a7-a9a73a98a063');

//increments hosts count by host id and keeps track of most recent booking
var incHostsCount = (hostId, date) => {
  var startTime = moment().valueOf();
  dbPostgres.incrementHostsCount(hostId, date, (err, data) => {
    if (err) {
      console.log('error! ' + err);
    } else {
      console.log('host insert successful!');
    }
    var endTime = moment().valueOf();
    console.log('time to increment hosts count:', (endTime - startTime), 'ms');
  })
}
// incHostsCount('316c0f95-44f8-475d-b165-03f528c8a127', '2018-03-24');

//run this on each booking object received {book_time:  , listing_id: }
//[TODO]: need to parse generated booking data to create these (csv to json)
  //loop through all those objects and run this function on each one
var processBooking = (booking) => {
  var date = booking.book_time;
  var listingId = booking.listing_id;
  incListingsCount(listingId);
  getHostId(listingId, (hostId) => {
    console.log('processing hostId:',hostId)
    incHostsCount(hostId, date);
  });
};

// var input = {
//   book_time: '2018-02-02',
//   listing_id: '3d9eaf4d-abe3-4706-83e0-f50e17149d09'
// }
// processBooking(input);



// models.setDirectory( __dirname + '/models').bind(
//   {
//       clientOptions: {
//           contactPoints: ['127.0.0.1'],
//           protocolOptions: { port: 9042 },
//           keyspace: 'airbnb',
//           queryOptions: {consistency: models.consistencies.one}
//       },
//       ormOptions: {
//           defaultReplicationStrategy : {
//               class: 'SimpleStrategy',
//               replication_factor: 1
//           },
//           migration: 'safe'
//       }
//   },
//   function(err) {
//       if(err) throw err;
//   }
// );

// var john = new models.instance.User({
//   id: 1,
//   hostBool: false,
//   superBool: false,
//   superDate: Date.now()
// });
// john.save(function(err){
//   if(err) {
//       console.log(err);
//       return;
//   }
//   console.log('Yuppiie!');
// });

// models.instance.User.findOne({id: 1}, function(err, data){
//   if(err) {
//       console.log(err);
//       return;
//   }
//   //Note that returned variable john here is an instance of your model,
//   //so you can also do john.delete(), john.save() type operations on the instance.
//   console.log('Found ' + data.id + ' to be ' + data.superDate + ' years old!');
// });