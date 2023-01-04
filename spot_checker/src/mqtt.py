from umqttsimple import MQTTClient, MQTTException
import machine
import time

def connect_mqtt(client_id, mqtt_server, user, password):
    client = MQTTClient(client_id, mqtt_server, user=user, password=password, keepalive=7200, ssl=True, 
                        ssl_params={'server_hostname': '9ad442f70b0a44f98a7f55588b7f03cf.s2.eu.hivemq.cloud'}, 
                        port=8883)
    client.connect()
    print('Connected to %s MQTT broker' % (mqtt_server))
    return client


def restart_and_reconnect():
    print('Failed to connect to MQTT broker. Reconnecting...')
    time.sleep(10)
    machine.reset()