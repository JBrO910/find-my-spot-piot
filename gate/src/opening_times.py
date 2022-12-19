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


def _check_time_weekday(workday_start, workday_end, weekend_start, hour, minute, weekday):
    if not workday_start or not workday_end:
        return False

    end_time_hour, end_time_minute = workday_end.split(':')  # 12:00

    if end_time_hour < hour or end_time_minute < minute:
        return False

    # If tomorrow is weekend, look at weekend start
    if weekday == 4:
        weekend_start_hour, weekend_start_minute = weekend_start.split(':') if weekend_start else 0, 0
        _deep_sleep_until(hour, minute, weekend_start_hour, weekend_start_minute)
        return True

    start_time_hour, start_time_minute = workday_start.split(':')
    _deep_sleep_until(hour, minute, start_time_hour, start_time_minute)
    return True


def _check_time_weekend(weekend_start, weekend_end, workday_start, hour, minute, weekday):
    if not weekend_start or not weekend_end:
        return False

    end_time_hour, end_time_minute = weekend_end.split(':')  # 12:00

    if end_time_hour < hour or end_time_minute < minute:
        return False

    # If tomorrow is weekend, look at weekend start
    if weekday == 6:
        workday_start_hour, workday_start_minute = workday_start.split(':') if workday_start else 0, 0
        _deep_sleep_until(hour, minute, workday_start_hour, workday_start_minute)
        return True

    start_time_hour, start_time_minute = weekend_start.split(':')
    _deep_sleep_until(hour, minute, start_time_hour, start_time_minute)
    return True


def check_time(opening_times_tuple):
    workday_start, workday_end, weekend_start, weekend_end = opening_times_tuple

    localtime = time.localtime()
    weekday = localtime[6]
    hour = localtime[3]
    minute = localtime[4]
    isTodayWeekday = weekday < 5

    if isTodayWeekday:
        _check_time_weekday(workday_start, workday_end, weekend_start, hour, minute, weekday)
    else:
        _check_time_weekend(weekend_start, weekend_end, workday_start, hour, minute, weekday)


def _deep_sleep_until(current_hour, current_minute, end_hour, end_minute):
    end_hour += 23
    end_hour += end_minute / 60

    current_hour += current_minute / 60
    time_in_millis += (end_hour - current_hour) * 60 * 60 * 1000

    machine.deepsleep(time_in_millis)