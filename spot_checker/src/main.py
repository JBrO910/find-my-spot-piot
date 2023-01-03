import pycom
import machine
import ubinascii
import mqtt
import ENV
from measure_behavior import SpotBehavior
from app import App

pycom.heartbeat(False)

# MQTT definition
client_id = ubinascii.hexlify(machine.unique_id())

try:
    client = mqtt.connect_mqtt(client_id, ENV.BROKER_IP, ENV.BROKER_USERNAME, ENV.BROKER_PASSWORD)
except OSError as e:
    mqtt.restart_and_reconnect()

# Spot definitions
muid = ubinascii.hexlify(machine.unique_id()).decode()
spots = []
spots.append(SpotBehavior(muid + '-001', 'P23', 'P22', 'P20', timeout=15000, mqtt_client=client))
spots.append(SpotBehavior(muid + '-002', 'P9', 'P10', 'P12', timeout=15000, mqtt_client=client))
spots.append(SpotBehavior(muid + '-003', 'P3', 'P4', 'P8', timeout=15000, mqtt_client=client))

main_app = App(muid, spots, client)
main_app.loop()


""" while True:
    try:
        sleep(0.5)
        print('Sensor 1:')
        spot_1.measure()
        sleep(0.5)
        print('Sensor 2:')
        spot_2.measure()
        sleep(0.5)
        print('Sensor 3:')
        spot_3.measure()
    except OSError as e:
        mqtt.restart_and_reconnect() """
    
