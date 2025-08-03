from datetime import time
from datetime import datetime

send_time = ["19:17:11"]

while True:
    for time in send_time:
        if time == datetime.now().strftime("%H:%M:%S"):
            print(datetime.now().strftime("%H:%M:%S"))
            print("TIME!!!!!!!!!!!")
            break