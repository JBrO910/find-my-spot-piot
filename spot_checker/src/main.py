import pycom
from time import sleep
from hcsr04 import HCSR04
from machine import Pin
import machine
from ENV import TRIGGER_DISTANCE
import ubinascii
import mqtt
import json
import measure_behavior

pycom.heartbeat(False)

# Sensor definitions
# sensor = HCSR04(trigger_pin=25, echo_pin=14, echo_timeout_us=10000)
sensor_1 = HCSR04(trigger_pin='P22', echo_pin='P23', echo_timeout_us=10000)
red_led_1 = Pin('P21', mode=Pin.OUT)
green_led_1 = Pin('P20', mode=Pin.OUT)

# MQTT definition
# mqtt_server = '192.168.204.111'
# client_id = ubinascii.hexlify(machine.unique_id())

# MQTT topic
topic_spot_update = b'live-spot'

# try:
#     client = mqtt.connect_mqtt(client_id, mqtt_server)
# except OSError as e:
#     mqtt.restart_and_reconnect()

while True:
    # try:
    measure_behavior.measure_only(sensor_1, green_led_1, red_led_1, None)
    sleep(1)
    # except OSError as e:
    #     mqtt.restart_and_reconnect()
    