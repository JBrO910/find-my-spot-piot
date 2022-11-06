import json
from hcsr04 import HCSR04
from machine import Pin
from umqttsimple import MQTTClient
from ENV import TRIGGER_DISTANCE

topic_spot_update = b'live-spot'
topic_register = b'register'
topic_maintenance = b'maintenance'

class SpotBehavior:
    def __init__(self, id, local_identifier, trigger_pin, echo_pin, red_led, green_led, mqtt_client=None, timeout=10000):
        self.id = id
        self.local_identifier = local_identifier
        self.sensor = HCSR04(trigger_pin, echo_pin, echo_timeout_us=timeout)
        self.red_led = Pin(red_led, mode=Pin.OUT)
        self.green_led = Pin(green_led, mode=Pin.OUT)
        self.mqtt_client = mqtt_client
        self.mqtt_client.set_callback(self._sub_callback)
        self.mqtt_client.subscribe(topic_maintenance)
        self.is_occupied = None
        self.measurements = []

    def register(self):
        msg = json.dumps({"id": self.id, "localIdentifier": self.local_identifier, "status": "1"})
        self.mqtt_client.publish(topic_spot_update, msg)

    def measure(self):
        #self._check_maintenance()
        try:
            distance = self.sensor.distance_cm()
            print('Distance:', distance, 'cm')
            average = self._measure_avg(distance)
            print('Average:', average, 'cm')
            if average < TRIGGER_DISTANCE:
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
    
    def _measure_avg(self, distance):
        self.measurements.append(distance)
        average = sum(self.measurements) / len(self.measurements)
        if len(self.measurements) == 5:
            del self.measurements[0]
            print(self.measurements)
        
        return average

    def _check_maintenance(self):
        print(self.mqtt_client.check_msg())

    def _sub_callback(self, topic, msg):
        print((topic, msg))
        if topic == b'maintenance' and msg == b'received':
            print('Brocker received hello message')