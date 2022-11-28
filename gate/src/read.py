import json
from ENV import SEND_UID
import mfrc522
import json
from machine import Pin, PWM
from time import sleep
from os import uname

PAUSE = 0.01


class Reader:

    def __init__(self, muid, mqtt_client):
        self.rdr = mfrc522.MFRC522(18, 23, 19, 4, 2)
        self.servo = PWM(Pin(12), freq=50)
        self.mqtt_client = mqtt_client
        self.muid = muid

    def do_read(self):
        # print("")
        # print('READER')
        # print("Place card before reader to read from address 0x08")
        # print("")

        (stat, tag_type) = self.rdr.request(self.rdr.REQIDL)

        if stat != self.rdr.OK:
            return
        (stat, raw_uid) = self.rdr.anticoll()
        uid = "0x%02x%02x%02x%02x" % (raw_uid[0], raw_uid[1], raw_uid[2], raw_uid[3])

        if stat != self.rdr.OK:
            return
        print("New card detected")
        print("  - tag type: 0x%02x" % tag_type)
        print("  - uid	 : ", uid)
        print("")

        return uid

    def open_gate(self):
        for duty in range(0, 100):
            self.servo.duty(duty)
            sleep(PAUSE)

        for duty in range(100, 0, -1):
            self.servo.duty(duty)
            sleep(PAUSE)
