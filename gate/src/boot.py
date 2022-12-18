import network
import time
import machine
import ntptime_local

ssid = 'JoshuaHotspot'
password = 'kommrein'
station = network.WLAN(network.STA_IF)

station.active(True)
station.connect(ssid, password)

start = time.time()
while station.isconnected() == False:
    machine.idle()
    if time.time() - start > 10:
        machine.reset()
    pass

print('Connection successful')
ntptime_local.timezone = 1
ntptime_local.settime()
print(time.localtime())
