import network
import time
import machine

ssid = 'JoshuaHotspot'
password = 'kommrein'
station = network.WLAN(network.STA_IF)

station.active(True)
station.connect(ssid, password)

start = time.time()
while station.isconnected() == False:
    if time.time() - start > 10:
        machine.reset()
    pass

print('Connection successful')
