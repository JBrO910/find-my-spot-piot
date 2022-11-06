from network import WLAN
import time
import machine

ssid = 'JoshuaHotspot'
password = 'kommrein'
station = WLAN(mode=WLAN.STA)

station.connect(ssid=ssid,auth=(WLAN.WPA2, password))

start = time.time()
while station.isconnected() == False:
    if time.time() - start > 10:
        machine.reset()
    pass

print('Connection successful')