var func = require('../helperFunctions.js');
var pg = require('../db/postgres/index.js');
var cass = require('../db/cassandra/index.js')

beforeAll(() => {
  cass.client.execute('INSERT INTO listings (id, hostid, name, superbool) VALUES (bd825fc0-da1f-4d6a-855d-a116d227fbe7, 03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c, \'test listing 000\', false);')
  // cass.client.execute('INSERT INTO listings (id, hostid, name, superbool) VALUES (0a9e2c83-8eb2-4d41-b9eb-0382cd6d623b, 03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c, \'test listing 000\', false);')
  cass.client.execute('INSERT INTO users (id, hostbool, superbool) VALUES (03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c, true, false);')
  cass.client.execute('INSERT INTO listings_by_host (hostid, listingid) VALUES (03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c, bd825fc0-da1f-4d6a-855d-a116d227fbe7);')
  // cass.client.execute('INSERT INTO listings_by_host (hostid, listingid) VALUES (03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c, 0a9e2c83-8eb2-4d41-b9eb-0382cd6d623b);')
  pg.client.query('DELETE FROM hosts_count WHERE hostid=\'03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c\';');  
  pg.client.query('DELETE FROM listings_count WHERE listingid IN (\'bd825fc0-da1f-4d6a-855d-a116d227fbe7\',\'0a9e2c83-8eb2-4d41-b9eb-0382cd6d623b\');');
  cass.client.execute('DELETE FROM bookings WHERE listingid=bd825fc0-da1f-4d6a-855d-a116d227fbe7 AND booktime=\'2018-02-06 00:00:00.000000\' IF EXISTS;');
  cass.client.execute('DELETE FROM bookings WHERE listingid=bd825fc0-da1f-4d6a-855d-a116d227fbe7 AND booktime=\'2018-02-06 00:01:00.000000\' IF EXISTS;');
  cass.client.execute('DELETE FROM bookings WHERE listingid=bd825fc0-da1f-4d6a-855d-a116d227fbe7 AND booktime=\'2018-02-07 00:01:00.000000\' IF EXISTS;');
  cass.client.execute('DELETE FROM bookings WHERE listingid=bd825fc0-da1f-4d6a-855d-a116d227fbe7 AND booktime=\'2018-02-07 00:05:00.000000\' IF EXISTS;');
  // pg.client.query('DELETE FROM superhosts WHERE hostid=\'03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c\';');  
})

test('expect getHostId to return correct results in correct format', (done) => {
  function callback(err, data) {
    expect(data).toEqual('9840d701-f8a7-4f10-82e7-23df9810d3e2');
    done();
  }
  func.getHostId('ba534c89-9688-459b-be49-90a9ad957797', callback);
});

test('expect getHostId to return correct results in correct format', (done) => {
  function callback(err, data) {
    expect(data).toEqual('49a5522e-300f-4c45-b73c-59707bf8630e');
    done();
  }
  func.getHostId('875d1c48-1277-4227-a172-6183a1fa4f66', callback);
});

test('expect getHostId to handle errors', (done) => {
  function callback(err, data) {
    expect(err.name).toBe('ResponseError');
    done();
  }
  func.getHostId('0000', callback);
});

test('expect processBooking to increment hosts_count table', done => {
  function callback(err, data) {
    expect(data.rows[0].hostid).toBe('03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c');
    expect(data.rows[0].count).toBe(1);
    done();
  }
  func.processBooking('2018-02-04 00:00:00.000000+0000', 'bd825fc0-da1f-4d6a-855d-a116d227fbe7', () => {
    pg.client.query('SELECT * FROM hosts_count WHERE hostid=\'03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c\';', callback)
  })
})

test('expect processBooking to increment listings_count table', done => {
  function callback(err, data) {
    expect(data.rows[0].listingid).toBe('bd825fc0-da1f-4d6a-855d-a116d227fbe7');
    expect(data.rows[0].count).toBe(2);
    done();
  }
  func.processBooking('2018-02-05 00:00:00.000000+0000', 'bd825fc0-da1f-4d6a-855d-a116d227fbe7', () => {
    pg.client.query('SELECT * FROM listings_count WHERE listingid=\'bd825fc0-da1f-4d6a-855d-a116d227fbe7\';', callback)
  })
})

test('expect receiveBookings to add booking to bookings table in cassandra', done => {
  function callback(err, data) {
    expect(JSON.parse(JSON.stringify(data.rows[0].listingid))).toBe('bd825fc0-da1f-4d6a-855d-a116d227fbe7');
    expect(JSON.parse(JSON.stringify(data.rows[0].booktime))).toBe('2018-02-06T08:00:00.000Z');
    done();
  }
  func.receiveBookings('2018-02-06 00:00:00.000000', 'bd825fc0-da1f-4d6a-855d-a116d227fbe7', () => {
    cass.client.execute('SELECT * FROM bookings WHERE listingid=bd825fc0-da1f-4d6a-855d-a116d227fbe7;', callback)
  })
});

test('expect receiveBookings to not add duplicate bookings', done => {
  function callback(err, data) {
    expect(data.rows.length).toBe(1);
    done();
  }
  func.receiveBookings('2018-02-06 00:00:00.000000', 'bd825fc0-da1f-4d6a-855d-a116d227fbe7', () => {
    cass.client.execute('SELECT * FROM bookings WHERE listingid=bd825fc0-da1f-4d6a-855d-a116d227fbe7 AND booktime=\'2018-02-06 00:00:00.000000\';', callback)
  });
});

test('expect receiveBookings to increment hosts_count if new booking', done => {
  function callback(err, data) {
    expect(data.rows[0].count).toBe(3);
    done();
  }
  func.receiveBookings('2018-02-06 00:01:00.000000', 'bd825fc0-da1f-4d6a-855d-a116d227fbe7', () => {
    pg.client.query('SELECT * FROM hosts_count WHERE hostid=\'03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c\';', callback)
  });
});

test('expect receiveBookings to increment listings_count if new booking', done => {
  function callback(err, data) {
    expect(data.rows[0].count).toBe(3);
    done();
  }
  func.receiveBookings('2018-02-06 00:01:00.000000', 'bd825fc0-da1f-4d6a-855d-a116d227fbe7', () => {
    pg.client.query('SELECT * FROM listings_count WHERE listingid=\'bd825fc0-da1f-4d6a-855d-a116d227fbe7\';', callback)
  });
});

test('expect getSuperhosts to return array of all hostids with count at 5 or more', done => {
  function callback(err, data) {
    data.forEach(superhost => {
      expect(superhost.count >= 5).toBeTruthy;
    })
    done();
  }
  func.receiveBookings('2018-02-07 00:01:00.000000', 'bd825fc0-da1f-4d6a-855d-a116d227fbe7', () => {
    func.receiveBookings('2018-02-07 00:05:00.000000', 'bd825fc0-da1f-4d6a-855d-a116d227fbe7', () => {      
      func.getSuperhosts(callback);
    });
  });
});

test('expect processNewSuperhosts to add new superhost to postgres superhosts table', done => {
  function callback(err, data) {
    expect((data.rows[0].superdate).toString()).toBe('Wed Feb 07 2018 00:00:00 GMT-0800 (PST)')
    done();
  }
  func.processNewSuperhosts(() => {
    pg.client.query('SELECT * FROM superhosts WHERE hostid=\'03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c\';', callback);
  });
});

test('expect processNewSuperhosts to update boolean in cassandra users table', done => {
  function callback(err, data) {
    expect(data.rows[0].superbool).toBeTruthy;
    done();
  }
  func.processNewSuperhosts(() => {
    cass.client.execute('SELECT * FROM users WHERE id=03e1bba2-fbd0-4e33-a5d1-28c5fde7fd8c;', callback);
  })
})

test('expect processNewSuperhosts to update boolean in cassandra listings table', done => {
  function callback(err, data) {
    expect(data.rows[0].superbool).toBeTruthy;
    done();
  }
  func.processNewSuperhosts(() => {
    cass.client.execute('SELECT * FROM listings WHERE id=bd825fc0-da1f-4d6a-855d-a116d227fbe7;', callback);
  })
})

test('expect processNewSuperhosts to update boolean for both of a host\'s listings in listings table', done => {
  function callback(err, data) {
    expect(data.rows[0].superbool).toBeTruthy;
    done();
  }
  func.processNewSuperhosts(() => {
    cass.client.execute('SELECT * FROM listings WHERE id=0a9e2c83-8eb2-4d41-b9eb-0382cd6d623b;', callback);
  });
});

test('expect processTopListings to add all details for top listings to postgres popular_listing_details table', done => {
  function callback(err, data) {
    expect(data.rows[0].listingid).toBe('bd825fc0-da1f-4d6a-855d-a116d227fbe7');
    done();
  }
  func.processTopListings(() => {
    pg.client.query('SELECT * FROM popular_listing_details;', callback)
  });
});







