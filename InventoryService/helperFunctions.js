var dbCassandra = require('./db/cassandra/index.js');
var dbPostgres = require('./db/postgres/index.js');


//------------------------------------------------------------------------------------------------------------

//queries cassandra db to get hostId by listingId
var getHostId = (listingId, callback) => {
  dbCassandra.getHostIdOfListing(listingId, (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      var result = (data[0].hostid).toString();
      callback(null, result);
    }
  });
}

//------------------------------------------------------------------------------------------------------------


var processBooking = (bookTime, listingId, callback) => {
  getHostId(listingId, (error, hostId) => {
    if (error) {
      callback(error, null);
    } else {
      dbPostgres.incrementHostsCount(hostId, bookTime, (err, data) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, 'hosts insert successul!');
        }
      })
    }
  });
  dbPostgres.incrementListingsCount(listingId, (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, 'listing insert successful!');
    }
  });
};

//book_time must have specific time to ms
//run this on each booking object received from sqs-consumer (book_time, listing_id)
var receiveBookings = (bookTime, listingId, callback) => {
  dbCassandra.addBooking(bookTime, listingId, (err, data) => {
    if (data['[applied]']) {
      processBooking(bookTime, listingId, (err, data) => {
        if (err) {
          callback(err, null)
        } else {
          callback(null, data)
        }
      });
    } else if (data['[applied]'] === false) {
      callback(null, data);
    } else {
      callback(err, null);
    }
  })
}

//------------------------------------------------------------------------------------------------------------

//get list of superhosts (>= 5 bookings)
var getSuperhosts = (callback) => {
  dbPostgres.queryForSuperhosts((err, data) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
}

//updates superhosts in tables: pg.superhosts, cass.users, cass.listings
var processNewSuperhosts = (callback) => {
  getSuperhosts((err, data) => {
    if (err) {
      callback(err, null);
    } else {
      data.forEach(superhost => {
        var hostid = superhost.hostid;
        var date = superhost.newestbookingdate;
        dbPostgres.addSuperhostToTable(hostid, date, (err, data) => {
          if (err) {
            callback(err, null);
          } else {
            if (data.rowCount) {
              dbCassandra.getListingIdsOfHost(hostid, (err, listingIds) => {
                if (err) {
                  callback(err, null);
                } else {
                  dbCassandra.promoteHostToSuperhost(hostid, listingIds, (err, data) => {
                    if (err) {
                      callback(err, null);
                    } else {
                      callback(null, data);
                    }
                  })
                }
              });
            } else {
              callback(data, null)
            }
          }
        });
      })
    };
  });
};



//------------------------------------------------------------------------------------------------------------


var processTopListings = (callback) => {
  dbPostgres.clearPopularListingsTable((err, data) => {
    if (err) {
      callback(err, null);
    } else {
      dbPostgres.queryForTopListings((err, topListings) => {
        if (err) {
          callback(err, null);
        } else {
          topListings.forEach(topListing => {
            var listingId = topListing.listingid;
            dbCassandra.getListingDetails(listingId, (err, data) => {
              if (err) {
                callback(err, null);
              } else {
                var listingId = data[0].id.toString();
                var name = data[0].name;
                var hostId = data[0].hostid.toString();
                var superBool = data[0].superbool;
                dbPostgres.addPopularListing(listingId, name, hostId, superBool, (err, data) => {
                  if (err) {
                    callback(err, null);
                  } else {
                    callback(null, data);
                  }
                })
              }
            })
          })
        }  
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
  processTopListings
};

