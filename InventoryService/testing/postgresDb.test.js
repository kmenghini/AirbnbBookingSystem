var db = require('../db/postgres/index.js');

test('two plus two is four', () => {
  expect(2 + 2).toBe(4);
});

test('expect incrementListingsCount to add new listing with count of 1')

test('expect incrementListingsCount to increment listings already in table')

test('expect incrementHostsCount to add new host with count of 1')

test('expect incrementHostsCount to increment hosts already in table')

test('expect incrementHostsCount to overwrite date in table on add')

test('expect queryForTopListings to have 5 or less listings')

test('expect queryForTopListing to return an array with most popular first')

test('expect queryForSuperhosts to return array of all hostids with count at 5 or more')

test('expect queryForSuperhosts array to not include hostid with count less than 5')

test('expect addSuperhostToTable to add new host to superhost table')

test('expect addSuperhostToTable to not overwrite date if host is already in table')

test('expect clearPopularListingsTable to truncate popular_listing_details table')

test('expect addPopularListing to add row to popular_listing_details table')

test('expect getPopularListingDetails to return the correct results in the correct format')