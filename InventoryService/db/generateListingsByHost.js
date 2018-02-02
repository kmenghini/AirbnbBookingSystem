const fs = require('fs');
var csv = require('csv');

module.exports.generate = function(n) {
  console.log('generating for file ' + n)
  var readStream = fs.createReadStream(`/Users/kmenghini/AirbnbData/listings${n}.txt`);
  var writeStream = fs.createWriteStream(`/Users/kmenghini/AirbnbData/listings${n}byhost.txt`);

  var opt  = {delimiter: ','};

  var parser = csv.parse(opt);

  let transformer = csv.transform(data => {
    var listingId = data[0];
    var hostId = data[1];
    return `${hostId},${listingId}\n`;
  });

  readStream.pipe(parser).pipe(transformer).pipe(writeStream);

  writeStream.on('finish', () => {  
    console.log('wrote to file');
    writeStream.end();
  });
}

