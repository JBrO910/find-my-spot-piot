from machine import Pin, PWM
from time import sleep
import machine
import ubinascii
import mqtt
import read
import ENV
from app import App

# MQTT definition
client_id = ubinascii.hexlify(machine.unique_id())

try:
    client = mqtt.connect_mqtt(client_id, ENV.BROKER_IP)
except OSError as e:
    mqtt.restart_and_reconnect()

muid = ubinascii.hexlify(machine.unique_id()).decode()
main_app = App(muid, client)
main_app.read_loop()
read.do_read()
