from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model_name = "Qwen/Qwen3-4B-Instruct-2507"
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Проверяем доступность ROCm
if torch.cuda.is_available():
    device = "cuda"
elif hasattr(torch, 'xpu') and torch.xpu.is_available():
    device = "xpu"
else:
    device = "cpu"

print(f"Используется устройство: {device}")