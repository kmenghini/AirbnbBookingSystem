var db = require('../db/postgres/index.js');

afterAll(() => {
  db.client.query('DELETE FROM hosts_count WHERE hostid=\'47a065e1-a52e-47b6-815f-72a1001556fa\';');  
  db.client.query('DELETE FROM listings_count WHERE listingid IN (\'d068c66b-1b0e-4d13-8d89-1c8aff63a624\',\'56424df1-a4b4-4d8d-a166-8b300d9eed03\',\'b5dee56c-15ed-481a-bf5f-bdd07d25565e\');');
  db.client.query('DELETE FROM popular_listing_details WHERE listingid IN (\'d068c66b-1b0e-4d13-8d89-1c8aff63a624\',\'56424df1-a4b4-4d8d-a166-8b300d9eed03\',\'b5dee56c-15ed-481a-bf5f-bdd07d25565e\');');
  db.client.query('DELETE FROM superhosts WHERE hostid=\'47a065e1-a52e-47b6-815f-72a1001556fa\';');  
  db.client.query('DELETE FROM superhosts WHERE hostid=\'4bae11e7-7131-44bf-a534-3aaa97f7f219\';')
});

test('expect incrementListingsCount to add new listing with count of 1', done => {
  function callback(err, res) {
    expect(res.rows[0].count).toBe(1);
    done();
  }
  db.incrementListingsCount('56424df1-a4b4-4d8d-a166-8b300d9eed03', () => {
    db.client.query('SELECT count FROM listings_count WHERE listingid=\'56424df1-a4b4-4d8d-a166-8b300d9eed03\';', callback);
  });
})

test('expect incrementListingsCount to increment listings already in table', done => {
  function callback(err, res) {
    expect(res.rows[0].count).toBe(2);
    done();
  }
  db.incrementListingsCount('56424df1-a4b4-4d8d-a166-8b300d9eed03', () => {
    db.client.query('SELECT count FROM listings_count WHERE listingid=\'56424df1-a4b4-4d8d-a166-8b300d9eed03\';', callback);
  });
})

test('expect incrementListingsCount to handle errors', done => {
  function callback(err, res) {
    expect(err.name).toBe('error');
    done();
  }
  db.incrementListingsCount('0000', callback);
})

test('expect incrementHostsCount to add new host with count of 1', done => {
  function callback(err, res) {
    expect(res.rows[0].count).toBe(1);
    done();
  }
  db.incrementHostsCount('47a065e1-a52e-47b6-815f-72a1001556fa','2018-01-01', () => {
    db.client.query('SELECT count FROM hosts_count WHERE hostid=\'47a065e1-a52e-47b6-815f-72a1001556fa\';', callback);
  });
})

test('expect incrementHostsCount to increment hosts already in table', done => {
  function callback(err, res) {
    expect(res.rows[0].count).toBe(2);
    done();
  }
  db.incrementHostsCount('47a065e1-a52e-47b6-815f-72a1001556fa','2018-01-02', () => {
    db.client.query('SELECT count FROM hosts_count WHERE hostid=\'47a065e1-a52e-47b6-815f-72a1001556fa\';', callback);
  });
})

test('expect incrementHostsCount to overwrite date in table on add', done => {
  function callback(err, res) {
    expect(res.rows[0].newestbookingdate.toString()).toBe('Wed Jan 03 2018 00:00:00 GMT-0800 (PST)');
    expect(res.rows[0].count).toBe(3);    
    done();
  }
  db.incrementHostsCount('47a065e1-a52e-47b6-815f-72a1001556fa','2018-01-03', () => {
    db.client.query('SELECT * FROM hosts_count WHERE hostid=\'47a065e1-a52e-47b6-815f-72a1001556fa\';', callback);
  });

})

test('expect incrementHostsCount to handle errors', done => {
  function callback(err, res) {
    expect(err.name).toBe('error');
    done();
  }
  db.incrementHostsCount('0000', '2018-01-02', callback);
});

test('expect queryForTopListings to have 5 or less listings', done => {
  function callback(err, res) {
    expect(res.length <= 5).toBe(true);
    done();
  }
  db.queryForTopListings(callback);
});

test('expect queryForTopListings to return an array with most popular first', done => {
  function callback(err, res) {
    expect(res.sort((a, b) => {
      return b.count - a.count;
    })).toEqual(res);
    done();
  }
  db.queryForTopListings(callback);
});

test('expect queryForSuperhosts to return array of all hostids with count at 5 or more', done => {
  function callback(err, res) {
    expect(Array.isArray(res)).toBe(true);
    res.forEach((host) => {
      expect(host.count >= 5).toBeTruthy;
    });
    done();
  }
  db.client.query('INSERT INTO hosts_count (hostid, count) VALUES (\'4bae11e7-7131-44bf-a534-3aaa97f7f219\', 5);', () => {
    db.queryForSuperhosts(callback);
  });
})

test('expect queryForSuperhosts array to not include hostid with count less than 5', done => {
  function callback(err, res) {
    res.forEach(host => {
      expect(host.hostid).not.toBe('47a065e1-a52e-47b6-815f-72a1001556fa');
    })
    done();
  }
  db.queryForSuperhosts(callback);
})

test('expect addSuperhostToTable to add new host to superhost table', done => {
  function callback(err, res) {
    expect(res.rows[0].hostid).toBe('4bae11e7-7131-44bf-a534-3aaa97f7f219');
    expect((res.rows[0].superdate).toString()).toBe('Mon Jan 01 2018 00:00:00 GMT-0800 (PST)')
    done();
  }
  db.addSuperhostToTable('4bae11e7-7131-44bf-a534-3aaa97f7f219', '2018-01-01', () => {
    db.client.query('SELECT * FROM superhosts WHERE hostid=\'4bae11e7-7131-44bf-a534-3aaa97f7f219\';', callback);
  })
})

test('expect addSuperhostToTable to not overwrite date if host is already in table', done => {
  function callback(err, res) {
    expect(res.rows[0].hostid).toBe('4bae11e7-7131-44bf-a534-3aaa97f7f219');
    expect((res.rows[0].superdate).toString()).toBe('Mon Jan 01 2018 00:00:00 GMT-0800 (PST)')
    done();
  }
  db.addSuperhostToTable('4bae11e7-7131-44bf-a534-3aaa97f7f219', '2018-01-11', () => {
    db.client.query('SELECT * FROM superhosts WHERE hostid=\'4bae11e7-7131-44bf-a534-3aaa97f7f219\';', callback);
  })
})

test('expect addSuperhostToTable to handle errors', done => {
  function callback(err, res) {
    expect(err.name).toBe('error');
    done();
  }
  db.addSuperhostToTable('00000', '2018-01-01', callback);
})

test('expect clearPopularListingsTable to truncate popular_listing_details table', done => {
  function callback(err, res) {
    expect(res.rows.length).toBe(0);
    done();
  }
  db.clearPopularListingsTable(() => {
    db.client.query('SELECT * FROM popular_listing_details', callback)
  })
})

test('expect addPopularListing to add row to popular_listing_details table', done => {
  function callback(err, res) {
    expect(res.rowCount).toBe(1);
    done();
  }
  db.addPopularListing('56424df1-a4b4-4d8d-a166-8b300d9eed03', 'test listing', '47a065e1-a52e-47b6-815f-72a1001556fa', false, callback)
})

test('expect addPopularListing to handle errors', done => {
  function callback(err, res) {
    expect(err.name).toBe('error');
    done();
  }
  db.addPopularListing('0000', 'test', '0000', false, callback);
});

test('expect getPopularListingDetails to return the correct results in the correct format', done => {
  function callback(err, res) {
    expect(JSON.parse(JSON.stringify(res[0]))).toEqual({
      listingid: '56424df1-a4b4-4d8d-a166-8b300d9eed03',
      name: 'test listing',
      hostid: '47a065e1-a52e-47b6-815f-72a1001556fa',
      superbool: false
    });
    done();
  }
  db.getPopularListingDetails('56424df1-a4b4-4d8d-a166-8b300d9eed03', callback)
});

test('expect getPopularListingDetails to handle errors', done => {
  function callback(err, res) {
    expect(err.name).toBe('error');
    done();
  }
  db.getPopularListingDetails('0000', callback);
});