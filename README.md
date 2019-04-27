# Weatherstation - Server

[![Build Status](https://travis-ci.com/aaj07/weatherstation-server.svg?branch=master)](https://travis-ci.com/aaj07/weatherstation-server)

This project provides a server for a weatherstation.
It listens to predefined UDP messages in its current network, stores the retrieved data based on the content and visualizes it.

See also [Weatherstation Client](https://github.com/aaj07/weatherstation-client).

## Installation

For the installation of the server, ```docker-compose``` and ```docker``` are required.

1. Open the terminal.
2. Go to the folder, where the project is located.
3. ```$ docker-compose build```

If you want to start server:

1. Open the terminal.
2. ```$ docker-compose up```.

## Input Data

The input data is based on UDP messages. Currently only the temperature and the humidity are supported, but further can be added.

### Structure

The format of the UDP messages can be seen here: [UDP message structure](https://github.com/aaj07/weatherstation-client#udp-message-structure).

## Data Visualization

The data is visualized on a http server.

The webpage, where the data is visualized can be accessed via [localhost:8000](localhost:8000).
