import requests
import os
import json
import pandas as pd
import joblib
import torch
import numpy as np

from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone


def get_data(city: str) -> dict:
    load_dotenv()
    api_key = os.getenv("c347bf3f0d99f2f5161013e6ee327ec1")

    url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
    response = requests.get(url)

    # проверка подключения
    if response.status_code == 200:
        json_data = json.dumps(response.json(), indent=4, ensure_ascii=False)
        print("conn est")
    else:
        print(f"bad conn - {response.status_code}")
        return {}

    # переделываем данные в дикт
    data = json.loads(json_data)
    return data


# while True:
get_data("Moscow")
