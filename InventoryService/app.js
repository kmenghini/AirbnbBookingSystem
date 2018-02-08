require('newrelic');

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
  dbCassandra.getListingDetails(req.params.listingId, (data) => {
    // console.log('got from cassandra')
    res.status(200).json(data[0]);
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

//queries cassandra db to get hostId by listingId
var getHostId = (listingId, callback) => {
  dbCassandra.getHostIdOfListing(listingId, (data) => {
    var result = (data[0].hostid).toString();
    callback(result);
  });
}
// getHostId('ea6375d2-51b0-4bca-b6a7-a9a73a98a053', data => console.log('getHostId', data));



//------------------------------------------------------------------------------------------------------------


//increments listings count by listingId
var incListingsCount = (listingId) => {
  dbPostgres.incrementListingsCount(listingId, (err, data) => {
    if (err) {
      console.log('error! ' + err);
    } else {
      console.log('listing insert successful!');
    }
  })
}
// incListingsCount('ea6375d2-51b0-4bca-b6a7-a9a73a98a063');

//increments hosts count by host id and keeps track of most recent booking
var incHostsCount = (hostId, date, startTime) => {
  dbPostgres.incrementHostsCount(hostId, date, (err, data) => {
    if (err) {
      console.log('error! ' + err);
    } else {
      console.log('host insert successful!');
    }
  })
}
// incHostsCount('316c0f95-44f8-475d-b165-03f528c8a127', '2018-03-24');


var processBooking = (booking) => {
  var date = booking.book_time;
  var listingId = booking.listing_id;
  incListingsCount(listingId);
  getHostId(listingId, (hostId) => {
    incHostsCount(hostId, date);
    console.log('booking loaded')
  });
};

//book_time must have specific time to ms
//run this on each booking object received from sqs-consumer {book_time:  , listing_id: }
var receiveBookings = (booking) => {
  dbCassandra.addBooking(booking.book_time, booking.listing_id, (data) => {
    if (data['[applied]']) {
      console.log('processing new booking', booking)
      processBooking(booking);
    }
  })
}

// var input = {
//   book_time: '2018-02-04',
//   listing_id: '73eb50d7-3fc6-4d05-8cf7-fbaa63779e5b'
// }
// processBooking(input);
// receiveBookings(input);





// var input = JSON.parse('{"listing_id":"76d023e4-077a-4380-b88e-190cdca4669d","book_time":"2018-02-07T17:13:30-08:00"}');
// receiveBookings(input);

//------------------------------------------------------------------------------------------------------------

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


//------------------------------------------------------------------------------------------------------------


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



module.exports.receiveBookings = receiveBookings;



var sum = (a, b) => {
  return a + b;
}
module.exports.sum = sum;