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
    });
  },
  queryForTopListings: (callback) => {
    var queryString = 'SELECT * FROM listings_count ORDER BY count DESC LIMIT 5;';
    client.query(queryString, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  queryForSuperhosts: (callback) => {
    var queryString = 'SELECT * FROM hosts_count WHERE count >= 5;';
    client.query(queryString, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  addSuperhostToTable: (id, date, callback) => {
    var queryString = 'INSERT INTO superhosts (hostid, superdate) VALUES ($1, $2) ON CONFLICT DO NOTHING;';
    client.query(queryString, [id, date], (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    });
  },
  clearPopularListingsTable: (callback) => {
    var queryString = 'TRUNCATE popular_listing_details;';
    client.query(queryString, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    });
  },
  addPopularListing: (listingId, name, hostId, superBool, callback) => {
    var queryString = 'INSERT INTO popular_listing_details (listingid, name, hostid, superbool) VALUES ($1, $2, $3, $4);';
    client.query(queryString, [listingId, name, hostId, superBool], (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res);
      }
    });
  },
  getPopularListingDetails: (listingId, callback) => {
    var queryString = 'SELECT * from popular_listing_details WHERE listingid=$1';
    client.query(queryString, [listingId], (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  client 
}

