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

create table bookings (
  bookTime timestamp,
  listingId uuid,
  PRIMARY KEY (listingId, bookTime)
);

