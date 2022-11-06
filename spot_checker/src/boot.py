from network import WLAN

ssid = 'JoshuaHotspot'
password = 'kommrein'
ssid = 'FRITZ!Box 3490'
password = '85368507722187996960'
station = WLAN(mode=WLAN.STA)

station.connect(ssid=ssid,auth=(WLAN.WPA2, password))

while station.isconnected() == False:
    pass

print('Connection successful')