import json
from hcsr04 import HCSR04
import machine
from ENV import TRIGGER_DISTANCE

topic_spot_update = b'live-spot'

def measure_and_send(sensor, green_led, red_led, is_occupied, mqtt_client):
    sensor_class = sensor
    distance = sensor.distance_cm()
    print('Distance:', distance, 'cm')
    if distance < TRIGGER_DISTANCE:
        # Spot is occupied
        green_led.value(1)
        red_led.value(0)
        if not is_occupied:
            msg = json.dumps({"id":"001", "status":"0",})
            mqtt_client.publish(topic_spot_update, msg)
        is_occupied = True
    else:
        # Spot is free
        red_led.value(1)
        green_led.value(0)
        if is_occupied:
            msg = json.dumps({ "id":"001", "status":"1",})
            mqtt_client.publish(topic_spot_update, msg)
        is_occupied = False

def measure_only(sensor, green_led, red_led, is_occupied):
    try:
        func = getattr(sensor, "distance_cm")
        distance = func()
    except AttributeError:
        print('distance_cm not found')
    # distance = sensor.distance_cm()
    print(type(sensor))
    print('Distance:', distance, 'cm')
    if distance < TRIGGER_DISTANCE:
        # Spot is occupied
        green_led.value(1)
        red_led.value(0)
        is_occupied = True
    else:
        # Spot is free
        red_led.value(1)
        green_led.value(0)
        is_occupied = False