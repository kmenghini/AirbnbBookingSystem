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


copy users from '/Users/kmenghini/AirbnbInventoryService/data/users1.txt' with delimiter=',';
copy bookings from '/Users/kmenghini/AirbnbInventoryService/data/bookings1.txt' with delimiter=',';
copy listings from '/Users/kmenghini/AirbnbInventoryService/data/listings1.txt' with delimiter=',';
