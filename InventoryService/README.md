# AirbnbInventoryService

The Inventory Service contains the main data store of the system. Its main purpose is to efficiently and effectively store a large amount of data.

In connection with the other microservices of the system, its main input and output points do the following:

-Supply the Search Microservice with detailed listing data in an efficient manner

-Keep track of the top listings of the system using input from the Booking Microservice

-Keeps an updated list of any superhosts along with the date that the host became a superhost