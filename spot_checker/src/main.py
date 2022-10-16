import pycom
from time import sleep
from hcsr04 import HCSR04
from machine import Pin
import machine
from ENV import TRIGGER_DISTANCE
import ubinascii
import mqtt
import json

pycom.heartbeat(False)

# Sensor definitions
# sensor = HCSR04(trigger_pin=25, echo_pin=14, echo_timeout_us=10000)
sensor = HCSR04(trigger_pin='P22', echo_pin='P23', echo_timeout_us=10000)
red_led = Pin('P21', mode=Pin.OUT)
green_led = Pin('P20', mode=Pin.OUT)

# MQTT definition
mqtt_server = '192.168.204.111'
client_id = ubinascii.hexlify(machine.unique_id())

# MQTT topic
topic_spot_update = b'live-spot'

try:
    client = mqtt.connect_mqtt(client_id, mqtt_server)
except OSError as e:
    mqtt.restart_and_reconnect()

is_occupied = True
while True:
    try:
        distance = sensor.distance_cm()
        print('Distance:', distance, 'cm')
        if distance < TRIGGER_DISTANCE:
            # Spot is occupied
            green_led.value(1)
            red_led.value(0)
            if not is_occupied:
                msg = json.dumps({"id":"001", "status":"0",})
                client.publish(topic_spot_update, msg)
            is_occupied = True
        else:
            # Spot is free
            red_led.value(1)
            green_led.value(0)
            if is_occupied:
                msg = json.dumps({ "id":"001", "status":"1",})
                client.publish(topic_spot_update, msg)
            is_occupied = False 
        sleep(1)
    except OSError as e:
        mqtt.restart_and_reconnect()
    