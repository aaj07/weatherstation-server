import paho.mqtt.client as mqtt
import paho.mqtt.publish as mqtt_publish
import pymysql as mysql
import datetime
from os import environ

db_host = "127.0.0.1"
db_name = "master_data_base"
db_master_table = "master_table"

if "DB_HOST" in environ:
    print(f"Found DB Host {environ.get('DB_HOST')}")
    db_host = environ.get('DB_HOST')


mydb = mysql.connect(
    host=db_host,
    user="root",
    passwd="",
    database=db_name,
    autocommit=True
)


mqtt_host = "192.168.178.99"


def initialize_db():
    with mydb.cursor() as cursor:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {db_name}.{db_master_table} (mac CHAR(16) UNIQUE, name TINYTEXT)")


# The callback for when the client receives a CONNACK response from the server.
def on_mqtt_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("esp/#")


# The callback for when a PUBLISH message is received from the server.
def on_mqtt_message(client, userdata, msg):
    print(msg.topic + " -> " + str(msg.payload))
    topicssplitup = msg.topic.split('/')
    insert_into_table(topicssplitup[1], topicssplitup[2], datetime.datetime.utcnow(), msg.payload.decode('utf-8'))


def insert_into_table(database, table, timestamp, value):
    mac_modified = f"MAC_{database}"
    with mydb.cursor() as cursor:
        publish = False
        nr_of_affected_rows = cursor.execute(f"CREATE DATABASE IF NOT EXISTS {mac_modified}")
        publish = publish or bool(nr_of_affected_rows)
        if table == "humidity":
            nr_of_affected_rows = cursor.execute(f"CREATE TABLE IF NOT EXISTS {mac_modified}.{table} (timestamp TIMESTAMP UNIQUE, {table} TINYINT)")
            value = round(float(value))
        elif table == "temperature":
            nr_of_affected_rows = cursor.execute(f"CREATE TABLE IF NOT EXISTS {mac_modified}.{table} (timestamp TIMESTAMP UNIQUE, {table} FLOAT(3,1))")
            value = round(float(value)*2)/2
        else:
            print(f"Unknown table type '{table}'!")
        publish = publish or bool(nr_of_affected_rows)
        nr_of_affected_rows = cursor.execute(f"INSERT INTO {mac_modified}.{table} (timestamp, {table}) VALUES ('{timestamp}', '{value}')")
        publish = publish or bool(nr_of_affected_rows)
        if publish:
            mqtt_publish.single(f"db/newValues/{database}", table, hostname=mqtt_host)
        
        nr_of_affected_rows = cursor.execute(f"INSERT IGNORE INTO {db_name}.{db_master_table} (mac) VALUES ('{mac_modified}')")
        if bool(nr_of_affected_rows):
            mqtt_publish.single("db/newMac", mac_modified, hostname=mqtt_host)


def main():
    initialize_db()
    client = mqtt.Client()
    client.on_connect = on_mqtt_connect
    client.on_message = on_mqtt_message
    client.connect(mqtt_host, 1883, 60)
    client.loop_forever()
        
main()
