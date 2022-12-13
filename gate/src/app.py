import machine

import ENV
import uos
import mqtt
import json
from read import Reader


class App:

    def __init__(self, muid, mqtt_client):
        self.muid = muid
        self.mqtt_client = mqtt_client
        self.mqtt_client.set_callback(self._sub_callback)
        self.is_registered_bool = None

        self.topics = dict()
        self.topics[ENV.REQUEST_ID] = self.request_id
        self.mqtt_client.subscribe(ENV.REQUEST_ID)
        self.topics[ENV.RECEIVE_ID] = self.receive_id
        self.mqtt_client.subscribe(ENV.RECEIVE_ID)
        self.topics[ENV.SEND_UID_RESPONSE] = self.receive_uid
        self.mqtt_client.subscribe(ENV.SEND_UID_RESPONSE)
        self.topics[ENV.CARD_REGISTER] = self.register_card
        self.mqtt_client.subscribe(ENV.CARD_REGISTER)
        self.topics[ENV.OPEN_GATE] = self.open_gate
        self.mqtt_client.subscribe(ENV.OPEN_GATE)
        self.reader = Reader(muid, mqtt_client)

    def read_loop(self):
        try:
            while True:
                if self.is_registered():
                    self.mqtt_client.check_msg()
                    uid = self.reader.do_read()
                    if uid is None:
                        continue
                    msg = json.dumps({"muid": self.muid, "uid": uid})
                    self.mqtt_client.publish(ENV.SEND_UID, msg)
                    self.mqtt_client.wait_msg()
                else:
                    print('WAIT FOR REGISTER')
                    self.mqtt_client.wait_msg()
        except OSError:
            mqtt.restart_and_reconnect()

    def write_loop(self):
        pass

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

    def open_gate(self, msg):
        if self.reader.muid == msg["id"]:
            self.reader.open_gate()

    def receive_uid(self, msg):
        if self.reader.muid == msg["muid"]:
            if msg["access"]:
                print('Access granted!')
                print('Enjoy your stay!')
                self.reader.open_gate()
            else:
                print('Access denied!')

    def register_card(self, msg):
        uid = None
        while uid is None:
            machine.idle()
            uid = self.reader.do_read()

        msg = json.dumps({"uid": uid})
        self.mqtt_client.publish(ENV.CARD_REGISTER_RESPONSE, msg)

    def request_id(self, msg):
        if not self.is_registered():
            msg = json.dumps({"data": self.muid, "type": "gate"})
            self.mqtt_client.publish(ENV.REQUEST_ID_RESPONSE, msg)

    def receive_id(self, msg):
        if not self.is_registered():
            if self.muid in msg["gates"]:
                file = open('id.txt', 'w')
                file.write(self.muid)
                file.close()
                self.is_registered_bool = True

    def _sub_callback(self, topic, msg):
        # print((topic, msg))
        print('Msg: ' + msg.decode() + ' Topic: ' + topic.decode())
        msg = json.loads(msg.decode())
        self.topics[topic](msg)
