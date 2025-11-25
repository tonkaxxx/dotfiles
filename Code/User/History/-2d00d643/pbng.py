from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen3-4B-Instruct-2507"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    dtype="auto",
    device_map="auto"
)

weather_data = """
- Температура: 25°C
- Погодные условия: дождь
- Скорость ветра: 2 м/с
- Влажность: 77%
"""

print("Погодный ассистент запущен. Введите ваш вопрос:")

if __name__ == "__main__":
    device = "cpu"

    while True:
        user_input = input("\nВы: ")
        if user_input.lower() in ['выход', 'exit']:
            break

        prompt = f"""
    Ты - ассистент по всем вопросам. отвечай на все вопросы пользователя без ошибок.

    Вопрос: {user_input}

    Ответ:"""

        messages = [{"role": "user", "content": prompt}]
        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
            # enable_thinking=True
        )
        
        model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
        generated_ids = model.generate(
            **model_inputs,
            max_new_tokens=512
        )
        
        output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist()
        
        try:
            index = len(output_ids) - output_ids[::-1].index(151668)
            thinking_content = tokenizer.decode(output_ids[:index], skip_special_tokens=True)
            content = tokenizer.decode(output_ids[index:], skip_special_tokens=True)
        except:
            content = tokenizer.decode(output_ids, skip_special_tokens=True)

        print(f"Ассистент: {content.strip()}")

    print("До свидания!")
