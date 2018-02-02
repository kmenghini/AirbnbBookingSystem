var cassandra = require('cassandra-driver');

var client = new cassandra.Client({contactPoints: ['127.0.0.1'], keyspace: 'airbnb'});
client.connect(function(err, result) {
    console.log('Cassandra Connected')
});

module.exports = {
  getListingDetails: (listingId, callback) => {
    client.execute('SELECT * FROM listings WHERE id = ?;',[listingId], (err, res) => {
      if (err) {
        callback(err);
      } else {
        callback(res.rows);
      }
    });
  },
  getHostIdOfListing: (listingId, callback) => {
    client.execute('SELECT hostId FROM listings WHERE id = ?;', [listingId], (err, res) => {
      if (err) {
        callback(err);
      } else {
        callback(res.rows);
      }
    });
  }
}

