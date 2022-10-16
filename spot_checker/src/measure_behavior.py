import json
from hcsr04 import HCSR04
from machine import Pin
from umqttsimple import MQTTClient
from ENV import TRIGGER_DISTANCE

topic_spot_update = b'live-spot'


class SpotBehavior:
    def __init__(self, trigger_pin, echo_pin, red_led, green_led, mqtt_client=None):
        self.sensor = HCSR04(trigger_pin, echo_pin, echo_timeout_us=10000)
        self.red_led = Pin(red_led, mode=Pin.OUT)
        self.green_led = Pin(green_led, mode=Pin.OUT)
        self.mqtt_client = mqtt_client
        self.is_occupied = None

    def measure(self):
        try:
            distance = self.sensor.distance_cm()
            print('Distance:', distance, 'cm')
            if distance < TRIGGER_DISTANCE:
                # Spot is occupied
                self.green_led.value(1)
                self.red_led.value(0)
                if not self.is_occupied and self.mqtt_client is not None:
                    msg = json.dumps({"id": "001", "status": "0", })
                    self.mqtt_client.publish(topic_spot_update, msg)
                self.is_occupied = True
            else:
                # Spot is free
                self.red_led.value(1)
                self.green_led.value(0)
                if self.is_occupied and self.mqtt_client is not None:
                    msg = json.dumps({"id": "001", "status": "1", })
                    self.mqtt_client.publish(topic_spot_update, msg)
                self.is_occupied = False
        except Exception as ex:
            print(ex)
