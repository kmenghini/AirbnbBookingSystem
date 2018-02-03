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

create table bookings (
  date timestamp PRIMARY KEY,
  listingId uuidd
);

create table listings_by_host (
  hostId uuid PRIMARY KEY,
  listingId uuid
);

copy users from '/Users/kmenghini/AirbnbData/users1.txt' with delimiter=',';
copy bookings from '/Users/kmenghini/AirbnbData/bookings1.txt' with delimiter=',';
copy listings from '/Users/kmenghini/AirbnbData/listings1.txt' with delimiter=',';

copy listings_by_host from '/Users/kmenghini/AirbnbData/listings1byhost.txt' with delimiter=',';
