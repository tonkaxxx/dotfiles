from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "utter-project/EuroLLM-1.7B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

text = '<|im_start|>system\n<|im_end|>\n<|im_start|>user\nпривет, ты кто? <|im_end|>\n<|im_start|>assistant\n'

inputs = tokenizer(text, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=50)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))

while True:
    print("\n" + "="*50)
    question = input("Задайте вопрос о погоде (или 'выход' для завершения): ")
    text = f"<|im_start|>system\n<|im_end|>\n<|im_start|>user\n{question} <|im_end|>\n<|im_start|>assistant\n"

    if question.lower() in ['выход', 'exit', 'quit']:
        break
        
    if question.strip():
        answer = assistant.ask(question)
        print(f"\nАссистент: {answer}")
    else:
        print("Пожалуйста, введите вопрос")