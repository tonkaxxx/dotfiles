from transformers import pipeline

print("Начинаем загрузку модели...")

try:
    # Используем более легкую модель для теста
    qa_pipeline = pipeline(
        "text-generation",
        model="distilgpt2",  # Самая легкая модель
        device=-1
    )
    print("Модель успешно загружена!")
    
    # Простой тестовый запрос
    prompt = "Привет! Какая сегодня погода?"
    
    print("Генерируем ответ...")
    response = qa_pipeline(
        prompt,
        max_new_tokens=50,
        do_sample=True,
        temperature=0.7
    )
    
    print("=" * 50)
    print("Ответ модели:")
    print(response[0]['generated_text'])
    print("=" * 50)
    
except Exception as e:
    print(f"Произошла ошибка: {e}")
    import traceback
    traceback.print_exc()

# Пауза
input("Нажмите Enter для выхода...")