from transformers import pipeline

class LocalWeatherAssistant:
    def __init__(self):
        self.qa_pipeline = pipeline(
            "text-generation",
            model="ruslanmv/LaMini-Flan-T5-248M",
            device=-1,  # CPU (для GPU укажите 0)
            torch_dtype="auto"
        )
    
    def get_weather_data(self):
        # Заглушка для реальных данных погоды
        return {
            'temperature': 15,
            'condition': 'облачно',
            'wind_speed': 5,
            'humidity': 65
        }
    
    def ask(self, question):
        weather = self.get_weather_data()
        context = f"""
        Прогноз погоды:
        - Температура: {weather['temperature']}°C
        - Условия: {weather['condition']}
        - Ветер: {weather['wind_speed']} м/с
        - Влажность: {weather['humidity']}%
        """
        
        prompt = f"""Ответь на вопрос основываясь на прогнозе погоды. Будь краток.
        
        {context}
        
        Вопрос: {question}
        Ответ:"""
        
        response = self.qa_pipeline(
            prompt,
            max_new_tokens=100,
            do_sample=True,
            temperature=0.3
        )[0]['generated_text']
        
        return response.split("Ответ:")[-1].strip()

# Использование
assistant = LocalWeatherAssistant()
print(assistant.ask("Как мне лучше одеться?"))