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
  promoteHostToSuperhost: (hostId, callback) => {
    client.execute('UPDATE users SET superbool=true WHERE id=? if exists;', [hostId], (err, res) => {
      if (err) {
        callback(err);
      } else {
        callback(res.rows);
      }
    });
    //option1: create a (linked) listingsByHostId table where hostid is the primary key - both tables must be kept updated constantly
    //option2: when I get the booking event it has the listingId, store that in the hosts_count table as well in an array
      //BUT even if you loop through that array it doesn't necessarily get ALL of that user's listings, only ones that have been booked
    //option 3: have separate table that has each user and an array of all their listingids - how would you create this
    //YOU'LL GET AN ERROR HERE....
    client.execute('UPDATE listings SET superbool=true WHERE hostid=? if exists;', [hostId], (err, res) => {
      if (err) {
        callback(err);
      } else {
        callback(res.rows);
      }
    });
  }
}

