from transformers import pipeline
from huggingface_hub import login

class LocalWeatherAssistant:
    def __init__(self):
        print("загружаем модель...")
        self.qa_pipeline = pipeline(
            "text-generation",
            model="utter-project/EuroLLM-1.7B-Instruct",
            device=0,
            dtype="auto",
            trust_remote_code=True
        )
        print("модель загружена!")
    
    def get_weather_data(self):
        # заглушка 
        return {
            'temperature': 15,
            'condition': 'облачно',
            'wind_speed': 5,
            'humidity': 65
        }
    
    def ask(self, question):
        weather = self.get_weather_data()
        context = f"""
        Текущий прогноз погоды:
        - Температура: {weather['temperature']}°C
        - Погодные условия: {weather['condition']}
        - Скорость ветра: {weather['wind_speed']} м/с
        - Влажность: {weather['humidity']}%
        """
        
        # Более строгий промпт с четкими инструкциями
        prompt = f"""<|system|>
Ты - ассистент погоды. Отвечай ТОЛЬКО на основе предоставленных данных о погоде. 
Не придумывай ничего лишнего. Отвечай кратко и по делу.
</s>
<|user|>
Данные о погоде: {context}

Вопрос: {question}

Отвечай ТОЛЬКО на основе предоставленных данных. Если в данных нет ответа - скажи "В прогнозе нет этой информации".
</s>
<|assistant|>
"""
        
        print("генерируем ответ...")
        response = self.qa_pipeline(
            prompt,
            max_new_tokens=100,
            do_sample=True,
            temperature=0.3,  # Уменьшаем температуру для более детерминированных ответов
            top_p=0.9,
            repetition_penalty=1.1,
            pad_token_id=50256,
            eos_token_id=50256
        )[0]['generated_text']
        
        print(response)

        # Извлекаем только ответ ассистента
        if "<|assistant|>" in response:
            answer = response.split("<|assistant|>")[-1].strip()
        else:
            answer = response.strip()
            
        # Очищаем ответ от возможных продолжений
        answer = answer.split("<|")[0].split("</s>")[0].strip()
        
        return answer

if __name__ == "__main__":
    assistant = LocalWeatherAssistant()
    
    while True:
        print("\n" + "="*50)
        question = input("Задайте вопрос о погоде (или 'выход' для завершения): ")
        
        if question.lower() in ['выход', 'exit', 'quit']:
            break
            
        if question.strip():
            answer = assistant.ask(question)
            print(f"\nАссистент: {answer}")
        else:
            print("Пожалуйста, введите вопрос")