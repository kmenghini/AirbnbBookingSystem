const fs = require('fs');
var csv = require('csv');
var server = require('../app.js');

module.exports.loadBookings = function(n) {
  console.log('loading bookings for file ' + n)
  var readStream = fs.createReadStream(`/Users/kmenghini/AirbnbData/bookings${n}copy.txt`);

  var opt  = {delimiter: ','};

  var parser = csv.parse(opt);

  let loader = csv.transform((data, index) => {
    var bookingObj = {
      book_time: data[0],
      listing_id: data[1]
    };
    server.receiveBookings(bookingObj);
  });

  readStream.pipe(parser).pipe(loader)
    .on('finish', () => {console.log('reached end of bookings file');});
 
}
