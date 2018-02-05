var cassandra = require('cassandra-driver');

var client = new cassandra.Client({contactPoints: ['127.0.0.1'], keyspace: 'airbnb'});
client.connect(function(err, result) {
    console.log('Cassandra Connected')
});

module.exports = {
  getListingDetails: (listingId, callback) => {
    client.execute('SELECT * FROM listings WHERE id=?;',[listingId], (err, res) => {
      if (err) {
        callback(err);
      } else {
        callback(res.rows);
      }
    });
  },
  getHostIdOfListing: (listingId, callback) => {
    client.execute('SELECT hostId FROM listings WHERE id=?;', [listingId], (err, res) => {
      if (err) {
        callback(err);
      } else {
        callback(res.rows);
      }
    });
  },
  promoteHostToSuperhost: (hostId, listingIdArr, callback) => {
    client.execute('UPDATE users SET superbool=true WHERE id=? if exists;', [hostId], (err, res) => {
      if (err) {
        callback(err);
      } else {
        callback(res.rows);
      }
    });
    listingIdArr.forEach(listingId => {
      client.execute('UPDATE listings SET superbool=true WHERE id=? if exists;', [listingId], (err, res) => {
        if (err) {
          callback(err);
        } else {
          callback(res.rows);
        }
      });
    })
  },
  getListingIdsOfHost: (hostId, callback) => {
    client.execute('SELECT listingid FROM listings_by_host WHERE hostid=?;', [hostId], (err, res) => {
      if (err) {
        callback(err);
      } else {
        var ids = res.rows.map(id => (id.listingid))
        callback(ids);
      }
    });
  }
}

