import paho.mqtt.client as mqtt
import pymysql as mysql
import datetime
from os import environ

db_host = "127.0.0.1"
if "DB_HOST" in environ:
  print(f"Found DB Host {environ.get('DB_HOST')}")
  db_host = environ.get('DB_HOST')

mydb = mysql.connect(
  host=db_host,
  user="root",
  passwd="",
  database="master_table",
  autocommit=True
)

# The callback for when the client receives a CONNACK response from the server.
def on_mqtt_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("esp/#")

# The callback for when a PUBLISH message is received from the server.
def on_mqtt_message(client, userdata, msg):
    print(msg.topic + " -> " + str(msg.payload))
    topicssplitup = msg.topic.split('/')
    insert_into_table(topicssplitup[1], topicssplitup[2], datetime.datetime.utcnow(), msg.payload.decode('utf-8'))

def insert_into_table(database, table, timestamp, value):
    print(f"CREATE DATABASE IF NOT EXISTS MAC_{database}")
    print(f"CREATE TABLE IF NOT EXISTS MAC_{database}.{table} (timestamp TIMESTAMP UNIQUE, {table} FLOAT(3,1)")
    print(f"INSERT INTO MAC_{database}.{table} (timestamp, {table}) VALUES ('{timestamp}', '{value}')")
    with mydb.cursor() as cursor:
        nr_of_affected_rows = cursor.execute(f"CREATE DATABASE IF NOT EXISTS MAC_{database}")
        print(f"Affected Row: {nr_of_affected_rows}")
        nr_of_affected_rows = cursor.execute(f"CREATE TABLE IF NOT EXISTS MAC_{database}.{table} (timestamp TIMESTAMP UNIQUE, {table} FLOAT(3,1))")
        print(f"Affected Row: {nr_of_affected_rows}")
        nr_of_affected_rows = cursor.execute(f"INSERT INTO MAC_{database}.{table} (timestamp, {table}) VALUES ('{timestamp}', '{value}')")
        print(f"Affected Row: {nr_of_affected_rows}")

def main():
  client = mqtt.Client()
  client.on_connect = on_mqtt_connect
  client.on_message = on_mqtt_message
  client.connect("192.168.178.99", 1883, 60)
  client.loop_forever()

main()

  