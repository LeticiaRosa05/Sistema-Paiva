from fastapi import FastAPI, UploadFile, File
import torch

app = FastAPI()

@app.get("/")
def home():
    # Teste para saber se o Python está vendo a placa de vídeo
    gpu_disponivel = torch.cuda.is_available()
    gpu_nome = torch.cuda.get_device_name(0) if gpu_disponivel else "Nenhuma"
    return {
        "status": "Sistema Paiva IA Online",
        "gpu_ativa": gpu_disponivel,
        "modelo_gpu": gpu_nome
    }

@app.post("/analisar")
async def analisar_imagem(image: UploadFile = File(...)):
    return {"mensagem": f"A IA recebeu a imagem {image.filename} e está pronta para processar!"}
