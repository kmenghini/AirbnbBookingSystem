\connect postgres

DROP DATABASE IF EXISTS airbnb_postgres;
CREATE DATABASE airbnb_postgres;

\connect airbnb_postgres;

create table listings_count (
  listingId uuid PRIMARY KEY NOT NULL UNIQUE,
  count INTEGER
);

create table hosts_count (
  hostId uuid PRIMARY KEY NOT NULL UNIQUE,
  count INTEGER,
  newestBookingDate date
);

create table superhosts (
  hostId uuid PRIMARY KEY NOT NULL UNIQUE,
  superDate date
);

create table popular_listing_details (
  listingId uuid PRIMARY KEY NOT NULL UNIQUE,
  name text,
  hostId uuid,
  superBool boolean
);

