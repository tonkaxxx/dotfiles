from transformers import pipeline
from huggingface_hub import login

class LocalWeatherAssistant:
    def __init__(self):
        print("загружаем модель...")
        self.qa_pipeline = pipeline(
            "text-generation",
            model="EleutherAI/gpt-j-6b",
            device=-1,
            dtype="auto"
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
        Прогноз погоды:
        - Температура: {weather['temperature']}°C
        - Условия: {weather['condition']}
        - Ветер: {weather['wind_speed']} м/с
        - Влажность: {weather['humidity']}%
        """
        
        prompt = f"""Ты - ассистент погоды. Ответь на вопрос основываясь на прогнозе погоды, говори только точные данные по прогнозу погоды из контекста. Будь полезен.
        
        {context}
        
        Вопрос: {question}
        Ответ:"""
        
        print("генерируем ответ...")
        response = self.qa_pipeline(
            prompt,
            max_new_tokens=1000,
            do_sample=True,
            temperature=0.8,
            pad_token_id=50256
        )[0]['generated_text']
        
        return response.split("Ответ:")[-1].strip()

if __name__ == "__main__":
    assistant = LocalWeatherAssistant()
    
    while True:
        # login(token="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")

        print("\n" + "="*50)
        question = input("Задайте вопрос о погоде (или 'выход' для завершения): ")
        
        if question.lower() in ['выход', 'exit', 'quit']:
            break
            
        if question.strip():
            answer = assistant.ask(question)
            print(f"\nАссистент: {answer}")
        else:
            print("Пожалуйста, введите вопрос")