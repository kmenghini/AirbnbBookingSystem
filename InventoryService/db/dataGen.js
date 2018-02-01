const uuid = require('uuid/v4');
const faker = require('faker');
const fs = require('fs');

let listingsStream = fs.createWriteStream('data/listings.txt');
let usersStream = fs.createWriteStream('data/users.txt');
let bookingsStream = fs.createWriteStream('data/bookings.txt');

///////////CREATE LISTINGS///////////////////////
var randomHome = function() {
  var home = ['Flat', 'Villa', 'Apartment', 'Cave', 'Cottage', 'Studio', 'Room', 'Yurt', 'Tent', 'Cabin', 'Home', 'House', 'Castle', 'Chalet', 'Loft', 'Penthouse', 'Treehouse', 'House', 'Apartment', 'Home'];  
  return home[Math.floor(Math.random() * 20)];
}

var randomListingName = function() {
  var city = faker.address.city;  
  var adj = faker.company.catchPhraseAdjective;  
  return `${adj()} ${randomHome()} in ${city()}`;
}

var createListing = function(listingId, hostId) {
   return `${listingId},${hostId},${randomListingName()},false`;
}
///////////////////////////////////////////////////


///////////CREATE BOOKING///////////////////////////
var randomDate = function() {
  var fakeDate = JSON.stringify(faker.date.between('2018-01-01', '2018-01-31'));
  var yyyymmdd = fakeDate.slice(1,11);
  return yyyymmdd;
}

var createBooking = function(listingId) {
  return `${randomDate()},${listingId}`;
}
///////////////////////////////////////////////////


//////////CREATE USERS//////////////////////////////////
//random number, most often 1 but has an average of 2
var randomNumber = function() {
  var numberOptions = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];  
  return numberOptions[Math.floor(Math.random() * 10)];
}

var createUsers = function(n) {
  var usersList = [];
  var listingsList = [];
  var bookingsList = [];
  for (var i = 0; i < n; i++) {
    var user = [uuid(), false, false];
    if (i % 4 === 0) { 
      user[1] = true;      
      var numberOfListings = randomNumber();
      for (var j = 0; j < numberOfListings; j++) {
        var newListingId = uuid();
        listingsList.push(createListing(newListingId, user[0]));
        if (i % 12 === 0) {
          var numberOfBookings = randomNumber();
          for (var k = 0; k < numberOfBookings; k++) {
            bookingsList.push(createBooking(newListingId));
          }
        }
      }
    }
    usersList.push(user.join(','));
  }

  var listingsCsv = listingsList.join('\n');
  var usersCsv = usersList.join('\n');
  var bookingsCsv = bookingsList.join('\n');

  listingsStream.write(listingsCsv, 'utf8');
  usersStream.write(usersCsv, 'utf8');
  bookingsStream.write(bookingsCsv, 'utf8');
  
  listingsStream.on('finish', () => {  
    console.log('wrote listings to file');
  });
  usersStream.on('finish', () => {  
    console.log('wrote users to file');
  });
  bookingsStream.on('finish', () => {  
    console.log('wrote bookings to file');
  });
  listingsStream.end();
  usersStream.end();
  bookingsStream.end();
}
///////////////////////////////////////////////////


module.exports.createUsers = createUsers;