var dbCassandra = require('./db/cassandra/index.js');
var dbPostgres = require('./db/postgres/index.js');


//------------------------------------------------------------------------------------------------------------

//queries cassandra db to get hostId by listingId
var getHostId = (listingId, callback) => {
  dbCassandra.getHostIdOfListing(listingId, (err, data) => {
    if (err) {
      // throw err;
    } else {
      var result = (data[0].hostid).toString();
      callback(result);
    }
  });
}
// getHostId('ea6375d2-51b0-4bca-b6a7-a9a73a98a053', data => console.log('getHostId', data));


//------------------------------------------------------------------------------------------------------------


var processBooking = (bookTime, listingId) => {
  getHostId(listingId, (hostId) => {
    dbPostgres.incrementHostsCount(hostId, bookTime, (err, data) => {
      if (err) {
        console.log('error! ' + err);
      } else {
        console.log('host insert successful!');
      }
    })
    console.log('booking loaded')
  });
  dbPostgres.incrementListingsCount(listingId, (err, data) => {
    if (err) {
      console.log('error! ' + err);
    } else {
      console.log('listing insert successful!');
    }
  });
};

//book_time must have specific time to ms
//run this on each booking object received from sqs-consumer (book_time, listing_id)
var receiveBookings = (bookTime, listingId) => {
  console.log('in helper function');
  console.log(bookTime, listingId)
  dbCassandra.addBooking(bookTime, listingId, (data) => {
    if (data['[applied]']) {
      console.log('processing new booking')
      processBooking(bookTime, listingId);
    }
  })
}

// var book_time = '2018-02-04'
// var listing_id =  '73eb50d7-3fc6-4d05-8cf7-fbaa63779e5b'
// processBooking(book_time, listing_id);
// receiveBookings(book_time, listing_id);


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
var processNewSuperhosts = () => {
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

var processTopListings = () => {
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



module.exports = {
  getHostId,
  processBooking,
  receiveBookings,
  getSuperhosts,
  processNewSuperhosts,
  getTopListings,
  processTopListings
};

