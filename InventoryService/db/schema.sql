CREATE DATABASE airbnb_postgres;

use airbnb_postgres;

create table listings_count (
  listingId uuid PRIMARY KEY,
  count counter
);

create table hosts_count (
  hostId uuid PRIMARY KEY,
  count counter,
  newestBookingDate timestamp

);
