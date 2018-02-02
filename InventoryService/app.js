'use strict';

const bodyParser = require('body-parser');
var cassandra = require('cassandra-driver');
const express = require('express');
var models = require('express-cassandra');
const moment = require('moment');
var db = require('./db/index.js');

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

app.get('/inventory/:listingId', (req, res) => {
  var listingId = req.params.listingId;
  var startTime = moment().valueOf();
  db.getListingDetails(listingId, (data) => {
    res.status(200).json(data[0]);    
    var endTime = moment().valueOf();
    console.log('time for get request for listing details:', (endTime - startTime), 'ms');
  });
});

app.get('/hostId/:listingId', (req, res) => {
  var listingId = req.params.listingId;
  var startTime = moment().valueOf();
  db.getHostIdOfListing(listingId, (data) => {
    res.status(200).json(data[0]);    
    var endTime = moment().valueOf();
    console.log('time for get request for hostId:', (endTime - startTime), 'ms');
  });
});


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