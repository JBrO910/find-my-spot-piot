import pycom
from time import sleep
from hcsr04 import HCSR04
from machine import Pin
import machine
from ENV import TRIGGER_DISTANCE
import ubinascii
import mqtt
import json
from measure_behavior import SpotBehavior

pycom.heartbeat(False)

# Sensor definitions
spot_1 = SpotBehavior('P23', 'P22', 'P21', 'P20')
spot_2 = SpotBehavior('P9', 'P10', 'P11', 'P12')
spot_3 = SpotBehavior('P3', 'P4', 'P19', 'P8')


# MQTT definition
mqtt_server = '192.168.204.111'
client_id = ubinascii.hexlify(machine.unique_id())

# MQTT topic
topic_spot_update = b'live-spot'

try:
    client = mqtt.connect_mqtt(client_id, mqtt_server)
except OSError as e:
    mqtt.restart_and_reconnect()

while True:
    try:
        print('Sensor 1:')
        spot_1.measure()
        sleep(0.1)
        print('Sensor 2:')
        spot_2.measure()
        sleep(0.1)
        print('Sensor 3:')
        spot_3.measure()
        sleep(1)
    except OSError as e:
        mqtt.restart_and_reconnect()
