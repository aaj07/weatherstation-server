# Weatherstation - Server

[![Build Status](https://travis-ci.com/jerey/weatherstation-server.svg?branch=master)](https://travis-ci.com/jerey/weatherstation-server)

This project provides a server for a weatherstation.
It subscribes to various MQTT topics, stores the retrieved data based on the content and visualizes it.

See also [Weatherstation Client](https://github.com/jerey/weatherstation-client).

## Building and starting the server

For building and starting of the server, ```docker-compose``` and ```docker``` are required.

## Starting the server

To directly start the server, without building it, one can use pre-built docker images.

```docker-compose -f docker-compose.yml up```

This will, based on the defined version in the docker-compose.yml, pull two pre-built docker images of the weatherstation in the given version. For the available versions, please see the [weatherstation server](https://hub.docker.com/r/jerey/weatherstation-server) and the [weatherstation datahandler](https://hub.docker.com/r/jerey/weatherstation-datahandler).

## Building the server

In order to freshly build an image (e.g.: to include new changes), a second docker-compose file is used, to override the standard configuration.

```docker-compose -f docker-compose.yml -f docker-compose.override.yml build```

And then starting it:

```docker-compose -f docker-compose.yml -f docker-compose.override.yml up```

## Input data

The input data is based on MQTT. Currently the temperature and the humidity are stored to a database. Whenever new values are stored, the values are automatically updated in the visualization.

### MQTT topics

Following mqtt topics are currently in use for the visualization and storing of the data.

#### esp\/\#

This topic is used to insert new values to the database.
The [weatherstation client](https://github.com/jerey/weatherstation-client) can be used for publishing new data. The expected format is: ```esp/UID/VALUE_TYPE```.
The [weatherstation client](https://github.com/jerey/weatherstation-client) uses the ```mac adress``` of the device as ```UID``` and either the ```humidity``` or the ```temperature``` for the ```VALUE_TYPE```.

#### db\/newValues\/\#

This topic is used to update the visualization of the data.

##### db\/newValues\/newValues

Whenever any new value has been stored for a given ```UID```, the ```UID``` is published as value for this topic. The visualization then retrieves the latest data for the ```UID```.

##### db\/newValues\/newMac

Whenever a new ```UID``` has been stored, this topic is used to publish the new ```UID```.

## Data visualization

The data is visualized on a http server.

The webpage, where the data is visualized can be accessed via [localhost:8000](localhost:8000).
