var db = require('../db/cassandra/index.js');

// db.client.execute('SELECT * FROM listings WHERE id=c8e00877-6825-4ae0-83b7-5299ff0fcd3a;', (err, res) => {
//   if (err) {
//     (err)
//   } else {
//     console.log(res.rows);
//   }
// });

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
})

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
  // function callback(data) {
  //   expect(data).to
  // }
  // db.promoteHostToSuperhost()
})

test('expect promoteHostToSuperhost to update listings table')

test('expect promoteHostToSuperhost to update listings table when host has multiple listings')

test('expect getListingIdsOfHost to return array of uuids')

test('expect getListingIdsOfHost to return all listings a host has')

test('expect addBooking to add a new booking to the bookings table')
//data['[applied]']

test('expect addBooking to not add a duplicate booking')

test('expect addBooking to add bookings with same date but different times')


