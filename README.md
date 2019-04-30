# Weatherstation - Server

[![Build Status](https://travis-ci.com/aaj07/weatherstation-server.svg?branch=master)](https://travis-ci.com/aaj07/weatherstation-server)

This project provides a server for a weatherstation.
It listens to predefined UDP messages in its current network, stores the retrieved data based on the content and visualizes it.

See also [Weatherstation Client](https://github.com/aaj07/weatherstation-client).

## Building and starting the server

For building and starting of the server, ```docker-compose``` and ```docker``` are required.

## Starting the server

To directly start the server, without building it, one can use pre-built docker images.

```docker-compose -f docker-compose.yml up```

This will, based on the defined version in the docker-compose.yml, pull a pre-built docker image of the weatherstation in the given version. See [Docker Hub](https://hub.docker.com/r/aaj07/weatherstation-server) for the available versions.  

## Building the server

In order to freshly build an image (e.g.: to include new changes), a second docker-compose file is used, to override the standard configuration.

```docker-compose -f docker-compose.yml -f docker-compose.override.yml build```

And then starting it:

```docker-compose -f docker-compose.yml -f docker-compose.override.yml up```

## Input data

The input data is based on UDP messages. Currently only the temperature and the humidity are supported, but further can be added.

### Structure

The format of the UDP messages can be seen here: [UDP message structure](https://github.com/aaj07/weatherstation-client#udp-message-structure).

## Data visualization

The data is visualized on a http server.

The webpage, where the data is visualized can be accessed via [localhost:8000](localhost:8000).
