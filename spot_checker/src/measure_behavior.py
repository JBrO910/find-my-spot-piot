import json
from hcsr04 import HCSR04
from machine import Pin
from umqttsimple import MQTTClient
from ENV import TRIGGER_DISTANCE

topic_spot_update = b'live-spot'
topic_register = b'register'

class SpotBehavior:
    def __init__(self, id, local_identifier, trigger_pin, echo_pin, red_led, green_led, mqtt_client=None):
        self.id = id
        self.local_identifier = local_identifier
        self.sensor = HCSR04(trigger_pin, echo_pin, echo_timeout_us=10000)
        self.red_led = Pin(red_led, mode=Pin.OUT)
        self.green_led = Pin(green_led, mode=Pin.OUT)
        self.mqtt_client = mqtt_client
        self.is_occupied = None

    def register(self):
        msg = json.dumps({"id": self.id, "localIdentifier": self.local_identifier, "status": "1"})
        self.mqtt_client.publish(topic_spot_update, msg)

    def measure(self):
        try:
            distance = self.sensor.distance_cm()
            print('Distance:', distance, 'cm')
            if distance < TRIGGER_DISTANCE:
                # Spot is occupied
                self.green_led.value(1)
                self.red_led.value(0)
                if not self.is_occupied and self.mqtt_client is not None:
                    msg = json.dumps({"id": self.id, "status": "0", })
                    self.mqtt_client.publish(topic_spot_update, msg)
                self.is_occupied = True
            else:
                # Spot is free
                self.red_led.value(1)
                self.green_led.value(0)
                if self.is_occupied and self.mqtt_client is not None:
                    msg = json.dumps({"id": self.id, "status": "1", })
                    self.mqtt_client.publish(topic_spot_update, msg)
                self.is_occupied = False
        except Exception as ex:
            print(ex)
