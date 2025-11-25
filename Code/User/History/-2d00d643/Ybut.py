from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen3-1.7B"

# load the tokenizer and the model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    dtype="auto",
    device_map="auto"
)

# prepare the model input
prompt = "Привет, сколько сейчас градусов на улице?"
messages = [
    {"role": "user", "content": f"""
Ты - ассистент погоды. Отвечай ТОЛЬКО на основе предоставленных данных о погоде. 
Не придумывай ничего лишнего. Отвечай кратко, но тепло к юзеру и по делу.

Данные о погоде:
    - Температура: 25°C
    - Погодные условия: дождь
    - Скорость ветра: 2 м/с
    - Влажность: 77%

Вопрос: {prompt}

Отвечай ТОЛЬКО на основе предоставленных данных. Если в данных нет ответа - скажи "В прогнозе нет этой информации"""}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=False # Switches between thinking and non-thinking modes. Default is True.
)
model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

# conduct text completion
generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=32768
)
output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist() 

# parsing thinking content
try:
    # rindex finding 151668 (</think>)
    index = len(output_ids) - output_ids[::-1].index(151668)
except ValueError:
    index = 0

thinking_content = tokenizer.decode(output_ids[:index], skip_special_tokens=True).strip("\n")
content = tokenizer.decode(output_ids[index:], skip_special_tokens=True).strip("\n")

print("prompt:", prompt)
print("thinking content:", thinking_content)
print("content:", content)
