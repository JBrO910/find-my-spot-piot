import json
import ENV
import uos
from umqttsimple import MQTTClient
from time import sleep
import mqtt

topic_register = b'register'

class App:

    def __init__(self, muid, spots, mqtt_client):
        self.muid = muid
        self.spots = spots
        self.mqtt_client = mqtt_client
        self.mqtt_client.set_callback(self._sub_callback)
        self.is_registered_bool = None

        self.topics = dict()
        self.topics[ENV.REQUEST_ID] = self.request_id
        self.mqtt_client.subscribe(ENV.REQUEST_ID)
        self.topics[ENV.RECEIVE_ID] = self.receive_id
        self.mqtt_client.subscribe(ENV.RECEIVE_ID)
        self.topics[ENV.SIGNAL_LED] = self.signal_led
        self.mqtt_client.subscribe(ENV.SIGNAL_LED)
        self.topics[ENV.MEASURE_ONCE] = self.measure_once
        self.mqtt_client.subscribe(ENV.MEASURE_ONCE)
        self.topics[ENV.DISABLE_SPOT] = self.disable_spot
        self.mqtt_client.subscribe(ENV.DISABLE_SPOT)
        self.topics[ENV.ENABLE_SPOT] = self.enable_spot
        self.mqtt_client.subscribe(ENV.ENABLE_SPOT)
        
        
        

    def loop(self):  
        while True:
            try:
                if self.is_registered():
                    print('I AM IN THE LOOP')
                    self.mqtt_client.check_msg()
                    sleep(1)  
                    for spot in self.spots:
                        print(spot.id)
                        spot.send_keep_alive()
                        spot.measure()
                        sleep(0.25)
                    
                else:
                    print('WAIT FOR REGISTER')
                    self.mqtt_client.wait_msg()
                    print('FILE NOT HERE')
            except OSError as e:
                mqtt.restart_and_reconnect()

                

    def is_registered(self):
        if self.is_registered_bool != None:
            return self.is_registered_bool
        try:
            uos.stat('id.txt')
            self.is_registered_bool = True
            return self.is_registered_bool
        except OSError:
            self.is_registered_bool = False
            return self.is_registered_bool

    def measure_once(self, msg):
        for spot in self.spots:
            if spot.id == msg["id"] and not spot.is_disabled:
                distance = spot.sensor.distance_cm()
                msg = json.dumps({"id": spot.id, "measure": distance})
                self.mqtt_client.publish(ENV.MEASURE_ONCE_RESPONSE, msg)
                sleep(1)
                break

    def signal_led(self, msg):
        for spot in self.spots:
            if spot.id == msg["id"] and not spot.is_disabled:
                for i in range(5):
                    spot.led.value(1)
                    sleep(0.5)
                    spot.led.value(0)
                    sleep(0.5)
                break


    def disable_spot(self, msg):
        for spot in self.spots:
            if spot.id == msg["id"]:
                spot.is_disabled = True
                spot.led.value(0)
                break

    def enable_spot(self, msg):
        for spot in self.spots:
            if spot.id == msg["id"]:
                spot.is_disabled = False
                break

    def request_id(self, msg):
        if not self.is_registered():
            msg = json.dumps({"data": [spot.id for spot in self.spots], "type": "spots"})
            self.mqtt_client.publish(ENV.REQUEST_ID_RESPONSE, msg)

    def receive_id(self, msg):
        if not self.is_registered():
            if self.muid in msg["spots"]:
                file = open('id.txt', 'w')
                file.write(self.muid)
                file.close()
                self.is_registered_bool = True

    def _sub_callback(self, topic, msg):
        #print((topic, msg))
        print('Msg: ' + msg.decode() + ' Topic: ' + topic.decode())
        msg = json.loads(msg.decode())
        self.topics[topic](msg)
