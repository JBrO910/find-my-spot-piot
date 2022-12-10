from network import WLAN
import time
import machine
import ntptime

ssid = 'JoshuaHotspot'
password = 'kommrein'
station = WLAN(mode=WLAN.STA)

station.connect(ssid=ssid,auth=(WLAN.WPA2, password))

start = time.time()
while station.isconnected() == False:
    machine.idle()
    if time.time() - start > 5:
        machine.reset()
    pass

print('Connection successful')
ntptime.settime()
print(time.localtime())
