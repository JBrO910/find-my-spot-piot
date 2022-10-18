import pycom
from time import sleep
import machine
import ubinascii
import mqtt
from measure_behavior import SpotBehavior

pycom.heartbeat(False)

# MQTT definition
mqtt_server = '192.168.204.111'
client_id = ubinascii.hexlify(machine.unique_id())

# MQTT topic
topic_spot_update = b'live-spot'

try:
    client = mqtt.connect_mqtt(client_id, mqtt_server)
except OSError as e:
    mqtt.restart_and_reconnect()

# Sensor definitions
spot_1 = SpotBehavior('001', 'HY 01','P23', 'P22', 'P21', 'P20', client)
spot_2 = SpotBehavior('002', 'HY 02','P9', 'P10', 'P11', 'P12', client)
spot_3 = SpotBehavior('003', 'HY 03', 'P3', 'P4', 'P19', 'P8', client)
spot_1.register()
spot_2.register()
spot_3.register()

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
