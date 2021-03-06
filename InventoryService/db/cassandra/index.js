var cassandra = require('cassandra-driver');

var client = new cassandra.Client({contactPoints: ['127.0.0.1'], keyspace: 'airbnb'});
client.connect(function(err, result) {
    console.log('Cassandra Connected')
});

module.exports = {
  getListingDetails: (listingId, callback) => {
    client.execute('SELECT * FROM listings WHERE id=?;',[listingId], (err, res) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, res.rows);
      }
    });
  },
  getHostIdOfListing: (listingId, callback) => {
    client.execute('SELECT hostId FROM listings WHERE id=?;', [listingId], (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  promoteHostToSuperhost: (hostId, listingIdArr, callback) => {
    client.execute('UPDATE users SET superbool=true WHERE id=? if exists;', [hostId], (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, 'user: ' + JSON.stringify(res.rows[0]));
      }
    });
    listingIdArr.forEach(listingId => {
      client.execute('UPDATE listings SET superbool=true WHERE id=? if exists;', [listingId], (err, res) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, 'listing: ' + JSON.stringify(res.rows[0]));
        }
      });
    })
  },
  getListingIdsOfHost: (hostId, callback) => {
    client.execute('SELECT listingid FROM listings_by_host WHERE hostid=?;', [hostId], (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        var ids = res.rows.map(id => (id.listingid))
        callback(null, ids);
      }
    });
  }, 
  addBooking: (bookTime, listingId, callback) => {
    var date = new Date(bookTime);
    client.execute('INSERT INTO bookings (listingid, booktime) VALUES (?, ?) IF NOT EXISTS;', [listingId, date], (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows[0]);
      }
    })
  },
  client
}

