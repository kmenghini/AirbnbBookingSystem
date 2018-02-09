var db = require('../db/cassandra/index.js');

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

test('expect promoteHostToSuperhost to update users table')

test('expect promoteHostToSuperhost to update listings table')

test('expect promoteHostToSuperhost to update listings table when host has multiple listings')

test('expect getListingIdsOfHost to return array of uuids')

test('expect getListingIdsOfHost to return all listings a host has')

test('expect addBooking to add a new booking to the bookings table')
//data['[applied]']

test('expect addBooking to not add a duplicate booking')

test('expect addBooking to add bookings with same date but different times')


