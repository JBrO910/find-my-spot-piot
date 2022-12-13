from network import WLAN
import time
import machine

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

rtc = machine.RTC()
rtc.ntp_sync("pool.ntp.org")
while not rtc.synced():
    machine.idle()

time.timezone(1*60**2)
print('Connection successful')
print(time.localtime())
