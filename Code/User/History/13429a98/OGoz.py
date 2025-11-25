from transformers import AutoModelForCausalLM, AutoTokenizer
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import time

app = Flask(__name__)
CORS(app)

url = "http://192.168.88.17:5000/api/get-24hrs"
model_name = "Qwen/Qwen3-1.7B"

# Кэшируем токенайзер и модель при загрузке
tokenizer = AutoTokenizer.from_pretrained(
    model_name,
    trust_remote_code=True,
    cache_dir="./model_cache"
)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,  # Используем float16 вместо auto для скорости
    device_map="auto",
    trust_remote_code=True,
    cache_dir="./model_cache"
)

# Компилируем модель для ускорения (PyTorch 2.0+)
if hasattr(torch, 'compile'):
    model = torch.compile(model)

# Кэш для погодных данных (чтобы не запрашивать повторно для одного города)
weather_cache = {}
CACHE_TIMEOUT = 300  # 5 минут

def get_weather_data(city):
    """Получение данных о погоде с кэшированием"""
    current_time = time.time()
    
    if city in weather_cache:
        data, timestamp = weather_cache[city]
        if current_time - timestamp < CACHE_TIMEOUT:
            return data
    
    try:
        response = requests.post(url, json={"city": city}, timeout=10)
        response.raise_for_status()
        weather_data = response.json()['for_ai']
        weather_cache[city] = (weather_data, current_time)
        return weather_data
    except requests.exceptions.RequestException as e:
        raise Exception(f"Ошибка получения данных о погоде: {str(e)}")

def ask_ai(user_input, city):
    start_time = time.time()
    
    weather_data = get_weather_data(city)
    print(f"Weather data received in {time.time() - start_time:.2f}s")

    prompt = f"""Ты - ассистент погоды. Отвечай ТОЛЬКО на основе данных о погоде. Не используй язык разметки markdown.
Если данных нет - скажи "В прогнозе нет этой информации".

Данные о погоде на сегодня: {weather_data}
Если влажность больше 85 процентов - говори что идет дождь.

Вопрос: {user_input}

Ответ:"""

    messages = [{"role": "user", "content": prompt}]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    # Ускоренная обработка
    model_inputs = tokenizer(text, return_tensors="pt").to(model.device)
    
    with torch.no_grad():  # Отключаем градиенты для инференса
        generated_ids = model.generate(
            **model_inputs,
            max_new_tokens=128,  # Уменьшили с 512
            do_sample=False,     # Отключаем сэмплирование для скорости
            temperature=0.1,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id,
            repetition_penalty=1.1,
            num_return_sequences=1,
            early_stopping=True
        )

    # Более быстрый декодинг
    response_text = tokenizer.decode(
        generated_ids[0][len(model_inputs.input_ids[0]):], 
        skip_special_tokens=True
    ).strip()

    print(f"AI processing time: {time.time() - start_time:.2f}s")
    return response_text

@app.route('/api/ask-ai', methods=['POST'])
def api_ask_ai():
    start_time = time.time()
    
    try:
        data = request.get_json()
        city = data.get('city', '').strip()
        user_input = data.get('user_input', '').strip()
        
        if not city or not user_input:
            return jsonify({
                'status': 'error',
                'message': 'City and user_input are required'
            }), 400
            
        if user_input == "test123":
            return jsonify({
                'status': 'success',
                'response': "На сегодня температура постепенно растёт с утра до дня, достигая максимума около 6,93 градусов в 12:00, затем немного снижается. Влажность стабильно повышается с утра до вечернего времени, достигая 77% к вечеру. Ветер умеренный, скорость варьируется от 5,95 до 8,16 м/с. Влажность не превышает 77%, поэтому дождя нет. На сегодня рекомендуется надеть теплую одежду — плед, свитер или кофту — из-за низкой температуры в вечернее время. В дневное время можно использовать легкую одежду, но при этом не забывать о тепле. Ветер может быть ощутимым, особенно в вечерние часы, поэтому можно взять пальто или куртку."
            }), 200

        response = ask_ai(user_input, city)
        
        total_time = time.time() - start_time
        print(f"Total request time: {total_time:.2f}s")
        
        return jsonify({
            'status': 'success',
            'response': response,
            'processing_time': f"{total_time:.2f}s"
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == "__main__":
    print("Server starting...")
    app.run(host='0.0.0.0', port=5050, debug=False, threaded=True)