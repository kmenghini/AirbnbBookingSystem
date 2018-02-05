create keyspace airbnb with replication = {'class': 'SimpleStrategy', 'replication_factor':1};

use airbnb;

create table users (
  id uuid PRIMARY KEY,
  hostBool boolean,
  superBool boolean
);

create table listings (
  id uuid PRIMARY KEY,
  name text,
  hostId uuid,
  superBool boolean
);


create table listings_by_host (
  hostId uuid,
  listingId uuid,
  PRIMARY KEY (hostId, listingId)
);

copy users from '/Users/kmenghini/AirbnbData/users1.txt' with delimiter=',';
copy listings from '/Users/kmenghini/AirbnbData/listings1.txt' with delimiter=',';
copy listings_by_host from '/Users/kmenghini/AirbnbData/listings1byhost.txt' with delimiter=',';
