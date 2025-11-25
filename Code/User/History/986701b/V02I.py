from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "utter-project/EuroLLM-1.7B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

text = '<|im_start|>system\n<|im_end|>\n<|im_start|>user\nTranslate the following English source text to Portuguese:\nEnglish: I am a language model for european languages. \nPortuguese: <|im_end|>\n<|im_start|>assistant\n'

inputs = tokenizer(text, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=20)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
