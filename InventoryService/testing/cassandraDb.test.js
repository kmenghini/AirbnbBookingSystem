var db = require('../db/cassandra/index.js');

beforeAll(() => {
  db.client.execute('UPDATE users SET superbool=false WHERE id=47a065e1-a52e-47b6-815f-72a1001556fa;');  
  db.client.execute('UPDATE listings SET superbool=false WHERE id IN (d068c66b-1b0e-4d13-8d89-1c8aff63a624,56424df1-a4b4-4d8d-a166-8b300d9eed03,b5dee56c-15ed-481a-bf5f-bdd07d25565e);');
  db.client.execute('DELETE FROM bookings WHERE listingid IN (d068c66b-1b0e-4d13-8d89-1c8aff63a624,56424df1-a4b4-4d8d-a166-8b300d9eed03,b5dee56c-15ed-481a-bf5f-bdd07d25565e);')
});

test('expect getListingDetails to return the correct results in the correct format', (done) => {
  function callback(data) {
    expect(JSON.parse(JSON.stringify(data[0]))).toEqual({
      id: 'c8e00877-6825-4ae0-83b7-5299ff0fcd3a',
      hostid: 'a4611423-ea29-42b1-bc21-28c31c85c158',
      name: 'Multi-tiered Treehouse in Martinaland',
      superbool: false
    });
    done();
  }
  db.getListingDetails('c8e00877-6825-4ae0-83b7-5299ff0fcd3a', callback);
});

test('expect getListingDetails to return exactly 1 result', (done) => {
  function callback(data) {
    expect(data.length).toBe(1);
    done();
  }
  db.getListingDetails('c8e00877-6825-4ae0-83b7-5299ff0fcd3a', callback);
});

test('expect getListingDetails to return empty array if listing doesn\'t exist', done => {
  function callback(data) {
    expect(data).toEqual([]);
    done();
  }
  db.getListingDetails('c8e00877-6825-4ae0-83b7-5299ff0fcd3b', callback);
});

// test('expect getListingDetails to err', done => {
//   function callback(error) {
//     expect(error).toBe('ERROR: ResponseError');
//     done();
//   }
//   db.getListingDetails('0000', callback); 
// });

test('expect getHostIdOfListing to return the correct results in the correct format', (done) => {
  function callback(data) {
    expect(JSON.parse(JSON.stringify(data[0]))).toEqual({
      hostid: 'a4611423-ea29-42b1-bc21-28c31c85c158'
    })
    done();
  }
  db.getHostIdOfListing('c8e00877-6825-4ae0-83b7-5299ff0fcd3a', callback);
});

test('expect getHostIdOfListing to only return hostid', (done) => {
  function callback(data) {
    expect(JSON.parse(JSON.stringify(data[0])).id).toBeUndefined;
    expect(JSON.parse(JSON.stringify(data[0])).name).toBeUndefined;
    expect(JSON.parse(JSON.stringify(data[0])).superbool).toBeUndefined;
    done();
  }
  db.getHostIdOfListing('c8e00877-6825-4ae0-83b7-5299ff0fcd3a', callback);
});

test('expect getHostIdOfListing to return undefined if listing doesn\'t exist', done => {
  function callback(data) {
    expect(data).toBeUndefined;
    done();
  }
  db.getHostIdOfListing('c8e00877-6825-4ae0-83b7-5299ff0fcd3b', callback);
});

test('expect promoteHostToSuperhost to update users table', done => {
  function callback(err, res) {
    expect(JSON.parse(JSON.stringify(res.rows[0]))).toEqual({
      id: '47a065e1-a52e-47b6-815f-72a1001556fa',
      hostbool: true,
      superbool: true
    });
    done();
  }
  db.promoteHostToSuperhost('47a065e1-a52e-47b6-815f-72a1001556fa', ['56424df1-a4b4-4d8d-a166-8b300d9eed03', 'd068c66b-1b0e-4d13-8d89-1c8aff63a624', 'b5dee56c-15ed-481a-bf5f-bdd07d25565e'], () => {
    db.client.execute('SELECT * FROM users WHERE id=47a065e1-a52e-47b6-815f-72a1001556fa;', callback);
  });
});

test('expect promoteHostToSuperhost to update listings table', done => {
  function callback(err, res) {
    expect(JSON.parse(JSON.stringify(res.rows[0])).superbool).toEqual(true);
    done();
  }
  db.promoteHostToSuperhost('47a065e1-a52e-47b6-815f-72a1001556fa', ['56424df1-a4b4-4d8d-a166-8b300d9eed03', 'd068c66b-1b0e-4d13-8d89-1c8aff63a624', 'b5dee56c-15ed-481a-bf5f-bdd07d25565e'], () => {
    db.client.execute('SELECT superbool FROM listings WHERE id=56424df1-a4b4-4d8d-a166-8b300d9eed03;', callback);
  });
});

test('expect promoteHostToSuperhost error', done => {
  function callback(data) {
    expect(data).toBeUndefined;
    done();
  }
  db.promoteHostToSuperhost('000', ['000'], callback);
});

test('expect promoteHostToSuperhost to update listings table when host has multiple listings', done => {
  function callback(err, res) {
    expect(JSON.parse(JSON.stringify(res.rows[0])).superbool).toEqual(true);
    expect(JSON.parse(JSON.stringify(res.rows[1])).superbool).toEqual(true);
    expect(JSON.parse(JSON.stringify(res.rows[2])).superbool).toEqual(true);
    done();
  }
  db.promoteHostToSuperhost('47a065e1-a52e-47b6-815f-72a1001556fa', ['56424df1-a4b4-4d8d-a166-8b300d9eed03', 'd068c66b-1b0e-4d13-8d89-1c8aff63a624', 'b5dee56c-15ed-481a-bf5f-bdd07d25565e'], () => {
    db.client.execute('SELECT superbool FROM listings WHERE id IN (d068c66b-1b0e-4d13-8d89-1c8aff63a624,56424df1-a4b4-4d8d-a166-8b300d9eed03,b5dee56c-15ed-481a-bf5f-bdd07d25565e);', callback);
  });
})

test('expect getListingIdsOfHost to return array of uuids', done => {
  function callback(data) {
    expect(Array.isArray(data)).toBeTruthy;
    expect(JSON.parse(JSON.stringify(data[0])).length).toEqual(36);
    expect(data.length).toBe(3);    
    done();
  }
  db.getListingIdsOfHost('47a065e1-a52e-47b6-815f-72a1001556fa', callback)  
})

test('expect getListingIdsOfHost to return all listings a host has', done => {
  function callback(data) { 
    const result = JSON.parse(JSON.stringify(data))   
    expect(result).toContain('56424df1-a4b4-4d8d-a166-8b300d9eed03');
    expect(result).toContain('d068c66b-1b0e-4d13-8d89-1c8aff63a624');
    expect(result).toContain('b5dee56c-15ed-481a-bf5f-bdd07d25565e');
    expect(result.length).toBe(3);
    done();
  }
  db.getListingIdsOfHost('47a065e1-a52e-47b6-815f-72a1001556fa', callback)
})

test('expect addBooking to add a new booking to the bookings table', done => {
  function callback(err, res) {
    expect(JSON.parse(JSON.stringify(res.rows[0]))).toEqual({
      listingid: '56424df1-a4b4-4d8d-a166-8b300d9eed03',
      booktime: '2018-02-10T00:00:00.000Z'
    });
    done();
  }
  db.addBooking('2018-02-10', '56424df1-a4b4-4d8d-a166-8b300d9eed03', () => {
    db.client.execute('SELECT * FROM bookings WHERE listingid=56424df1-a4b4-4d8d-a166-8b300d9eed03', callback);
  });
})

test('expect addBooking to not add a duplicate booking', done => {
  function callback(err, res) {
    expect(JSON.parse(JSON.stringify(res.rows.length))).toEqual(1);
    done();
  }
  db.addBooking('2018-02-10', '56424df1-a4b4-4d8d-a166-8b300d9eed03', () => {
    db.client.execute('SELECT * FROM bookings WHERE listingid=56424df1-a4b4-4d8d-a166-8b300d9eed03', callback);
  });
})

test('expect addBooking to add bookings with same date but different times', done => {
  function callback(err, res) {
    expect(JSON.parse(JSON.stringify(res.rows.length))).toEqual(2);
    done();
  }
  db.addBooking('2018-02-10 04:00:00.000000', '56424df1-a4b4-4d8d-a166-8b300d9eed03', () => {
    db.client.execute('SELECT * FROM bookings WHERE listingid=56424df1-a4b4-4d8d-a166-8b300d9eed03', callback);
  });
})


