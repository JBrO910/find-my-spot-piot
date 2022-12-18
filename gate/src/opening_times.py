import json
import ENV
import time
import machine


def load_opening_times():
    file = open('id.json', 'r')
    json_object = json.load(file)

    if ENV.WORKDAY_START and ENV.WORKDAY_END in json_object.keys():
        workday_start = json_object[ENV.WORKDAY_START]
        workday_end = json_object[ENV.WORKDAY_END]
    else:
        workday_start = None
        workday_end = None

    if ENV.WEEKEND_START and ENV.WEEKEND_END in json_object.keys():
        weekend_start = json_object[ENV.WORKDAY_START]
        weekend_end = json_object[ENV.WORKDAY_END]
    else:
        weekend_start = None
        weekend_end = None

    file.close()
    return workday_start, workday_end, weekend_start, weekend_end


def check_time(opening_times_tuple):
    localtime = time.localtime()
    weekday = localtime[6]
    hour = localtime[3]
    minute = localtime[4]

    if weekday in range(0, 4):
        if opening_times_tuple[0] == None:
            return None

        end_time = opening_times_tuple[1].split(':')
        end_time_hour = end_time[0]
        end_time_minute = end_time[1]
        end_localtime = time.mktime((localtime[0],
                                     localtime[1],
                                     localtime[2],
                                     end_time_hour,
                                     end_time_minute,
                                     localtime[5],
                                     localtime[6],
                                     localtime[7]))

        # TODO Start time of next day for deepsleep
        if end_time_hour < hour:
            _enable_deep_sleep(end_localtime, time.mktime(localtime))
            return None

        # TODO Start time of next day for deepsleep
        if end_time_hour == hour and end_time_minute < minute:
            _enable_deep_sleep(end_localtime, time.mktime(localtime))
            return None



    else:
        if opening_times_tuple[2] == None:
            return None


def _enable_deep_sleep(end_localtime, localtime):
    diff_ms = (end_localtime - localtime) * 1000
    machine.deepsleep(diff_ms)
