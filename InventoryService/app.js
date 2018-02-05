'use strict';

const bodyParser = require('body-parser');
var cassandra = require('cassandra-driver');
const express = require('express');
// var models = require('express-cassandra');
const moment = require('moment');
var dbCassandra = require('./db/cassandra/index.js');
var dbPostgres = require('./db/postgres/index.js');
var cron = require('node-cron');


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

//uncomment to load bookings csv into postgres tables
// var bookingsToPg = require('./db/loadBookingsToPostgres.js');
// bookingsToPg.loadBookings(1);

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
  // var startTime = moment().valueOf();
  dbCassandra.getHostIdOfListing(listingId, (data) => {
    var result = (data[0].hostid).toString();
    // var endTime = moment().valueOf();
    // console.log('time to find hostId:', (endTime - startTime), 'ms');
    callback(result);
  });
}
// getHostId('ea6375d2-51b0-4bca-b6a7-a9a73a98a053', data => console.log('getHostId', data));

//increments listings count by listingId
var incListingsCount = (listingId) => {
  // var startTime = moment().valueOf();
  dbPostgres.incrementListingsCount(listingId, (err, data) => {
    if (err) {
      console.log('error! ' + err);
    } else {
      console.log('listing insert successful!');
    }
    // var endTime = moment().valueOf();
    // console.log('time to increment listings count:', (endTime - startTime), 'ms');
  })
}
// incListingsCount('ea6375d2-51b0-4bca-b6a7-a9a73a98a063');

//increments hosts count by host id and keeps track of most recent booking
var incHostsCount = (hostId, date) => {
  // var startTime = moment().valueOf();
  dbPostgres.incrementHostsCount(hostId, date, (err, data) => {
    if (err) {
      console.log('error! ' + err);
    } else {
      console.log('host insert successful!');
    }
    // var endTime = moment().valueOf();
    // console.log('time to increment hosts count:', (endTime - startTime), 'ms');
  })
}
// incHostsCount('316c0f95-44f8-475d-b165-03f528c8a127', '2018-03-24');

//run this on each booking object received {book_time:  , listing_id: }
var processBooking = (booking) => {
  var date = booking.book_time;
  var listingId = booking.listing_id;
  incListingsCount(listingId);
  getHostId(listingId, (hostId) => {
    incHostsCount(hostId, date);
    console.log('booking loaded')    
  });
};
// var input = {
//   book_time: '2018-02-04',
//   listing_id: '73eb50d7-3fc6-4d05-8cf7-fbaa63779e5b'
// }
// processBooking(input);

//get list of superhosts (>= 5 bookings)
var getSuperhosts = (callback) => {
  dbPostgres.queryForSuperhosts((err, data) => {
    if (err) {
      console.log('superhost error! ' + err);
    } else {
      callback(data);
    }
  });
}

//updates superhosts in tables: pg.superhosts, cass.users, cass.listings
var newSuperhosts = () => {
  getSuperhosts((data) => {
    data.forEach(superhost => {
      var hostid = superhost.hostid;
      var date = superhost.newestbookingdate;
      dbPostgres.addSuperhostToTable(hostid, date, (err, data) => {
        if (err) {
          console.log('superhost error! ' + err);
        } else {
          if (data.rowCount) {
            dbCassandra.getListingIdsOfHost(hostid, (listingIds) => {
              dbCassandra.promoteHostToSuperhost(hostid, listingIds, (data) => {
                console.log('updated superbool in cassandra for', data);
              })
            });
          }
        }
      });
    });
  });
};
//in a cron job to check for new superhosts twice a day
cron.schedule('00 2,14 * * *', newSuperhosts);


//get top listings (top 5)
var getTopListings = (callback) => {
  dbPostgres.queryForTopListings((err, data) => {
    if (err) {
      console.log('top listings error' + err);
    } else {
      callback(data);
    }
  });
}

var newTopListings = () => {
  dbPostgres.clearPopularListingsTable((err, data) => {
    if (err) {
      console.log('clear top listings error' + err);
    } else {
      getTopListings((topListings) => {
        topListings.forEach(topListing => {
          var listingId = topListing.listingid;
          dbCassandra.getListingDetails(listingId, (data) => {
            var listingId = data[0].id.toString();
            var name = data[0].name;
            var hostId = data[0].hostid.toString();
            var superBool = data[0].superbool;
            //move this table to redis later
            dbPostgres.addPopularListing(listingId, name, hostId, superBool, (err, data) => {
              if (err) {
                console.log('add top listing error' + err);
              } else {
                console.log('popular listing added!');
              }
            })
          });
        })
      })
    }
  });
}
//in cron job to get top listings twice a day
cron.schedule('30 2,14 * * *', newTopListings);




module.exports.processBooking = processBooking;