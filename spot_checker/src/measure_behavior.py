import json
from hcsr04 import HCSR04
from machine import Pin
from umqttsimple import MQTTClient
from ENV import TRIGGER_DISTANCE
from time import sleep

topic_spot_update = b'spot/update'

class SpotBehavior:
    def __init__(self, id, trigger_pin, echo_pin, led, mqtt_client=None, timeout=10000):
        self.id = id
        self.sensor = HCSR04(trigger_pin, echo_pin, echo_timeout_us=timeout)
        self.led = Pin(led, mode=Pin.OUT)
        self.mqtt_client = mqtt_client
        self.is_occupied = None
        self.measurements = []
        self.is_disabled = False

    def measure(self):
        if not self.is_disabled:
            try:
                distance = self.sensor.distance_cm()
                print('Distance:', distance, 'cm')
                average = self._measure_avg(distance)
                print('Average:', average, 'cm')
                if average < TRIGGER_DISTANCE:
                    # Spot is occupied
                    self.led.value(0)
                    if not self.is_occupied and self.mqtt_client is not None:
                        msg = json.dumps({"id": self.id, "status": "0", })
                        sleep(0.5)
                        self.mqtt_client.publish(topic_spot_update, msg)
                    self.is_occupied = True
                else:
                    # Spot is free
                    self.led.value(1)
                    if self.is_occupied and self.mqtt_client is not None:
                        msg = json.dumps({"id": self.id, "status": "1", })
                        sleep(0.5)
                        self.mqtt_client.publish(topic_spot_update, msg)
                    self.is_occupied = False
            except Exception as ex:
                print(ex)
    
    def _measure_avg(self, distance):
        self.measurements.append(distance)
        average = sum(self.measurements) / len(self.measurements)
        if len(self.measurements) == 5:
            del self.measurements[0]
            print(self.measurements)
        
        return average
