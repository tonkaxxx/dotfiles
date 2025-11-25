import torch

print("PyTorch detects GPU:", torch.cuda.is_available())
device = torch.device("cuda")

print("Allocating tensors on GPU...")
a = torch.randn((1000, 1000), device=device, dtype=torch.float32)
b = torch.randn((1000, 1000), device=device, dtype=torch.float32)

print("Running matrix multiplication...")
result = torch.matmul(a, b)
torch.cuda.synchronize()

print("✅ PyTorch HIP execution successful!")