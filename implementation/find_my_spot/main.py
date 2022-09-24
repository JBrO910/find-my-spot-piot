import pycom
from time import sleep
from hcsr04 import HCSR04
from machine import Pin

pycom.heartbeat(False)

# sensor = HCSR04(trigger_pin=25, echo_pin=14, echo_timeout_us=10000)
sensor = HCSR04(trigger_pin='P22', echo_pin='P23', echo_timeout_us=10000)
red_led = Pin('P21', mode=Pin.OUT)
green_led = Pin('P20', mode=Pin.OUT)

while True:
    distance = sensor.distance_cm()
    print('Distance:', distance, 'cm')
    if distance < 5:
        green_led.value(1)
        red_led.value(0)
    else:
        red_led.value(1)
        green_led.value(0)
    sleep(1)