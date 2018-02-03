const { Client } = require('pg');
console.log('Initializing postgres');

const client = new Client({
  connectionString: 'postgres://kmenghini@localhost:5432/airbnb_postgres'
});

client.connect();

module.exports = {
  incrementListingsCount: (listingId, callback) => {
    var queryString = 'INSERT INTO listings_count (listingid, count) VALUES ($1, 1) ON CONFLICT (listingid) DO UPDATE SET count = listings_count.count + 1';
    client.query(queryString, [listingId], (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    })
  },
  incrementHostsCount: (hostId, date, callback) => {
    var queryString = 'INSERT INTO hosts_count (hostid, count, newestbookingdate) VALUES ($1, 1, $2) ON CONFLICT (hostid) DO UPDATE SET count = hosts_count.count + 1, newestbookingdate = ($2)';
    client.query(queryString, [hostId, date], (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    })
  } 

}

