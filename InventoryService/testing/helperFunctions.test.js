var func = require('../helperFunctions.js');

test('expect getHostId to return correct results in correct format', (done) => {
  function callback(data) {
    expect(data).toEqual('9840d701-f8a7-4f10-82e7-23df9810d3e2');
    done();
  }
  func.getHostId('ba534c89-9688-459b-be49-90a9ad957797', callback);
});

test('expect getHostId to return correct results in correct format', (done) => {
  function callback(data) {
    expect(data).toEqual('49a5522e-300f-4c45-b73c-59707bf8630e');
    done();
  }
  func.getHostId('875d1c48-1277-4227-a172-6183a1fa4f66', callback);
});

test('expect incListingsCount to add new listing with count of 1')

test('expect incListingsCount to increment listings already in table')

test('expect incHostsCount to add new host with count of 1')

test('expect incHostsCount to increment hosts already in table')

test('expect incHostsCount to overwrite date in table on add')

test('expect processBooking to increment hosts_count table')

test('expect processBooking to increment listings_count table')

test('expect receiveBookings to add booking to bookings table in cassandra');

test('expect receiveBookings to not add duplicate bookings')

test('expect receiveBookings to increment hosts_count and listing_count if new booking')

test('expect getSuperhosts to return array of all hostids with count at 5 or more')

test('expect getSuperhosts array to not include hostid with count less than 5')

test('expect newSuperhosts to add new superhost to postgres superhosts table')

test('expect newSuperhosts to update boolean in cassandra users and listings tables')

test('expect getTopListings to return array of top listingids')

test('expect getTopListings to return array with max length 5')

test('expect newTopListings to add all details for top listings to postgres popular_listing_details table')

test('expect old listings to not be in popular_listing_details table')






