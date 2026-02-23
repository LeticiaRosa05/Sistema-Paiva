import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from google import genai
from PIL import Image

app = FastAPI()

try:
    with open('apikey.txt', 'r', encoding='utf-8') as arquivo:
        CHAVE_API = arquivo.read().replace('\n', '').replace('\r', '').strip()

    client = genai.Client(api_key=CHAVE_API)
except Exception as e:
    print(f"CRÍTICO: não foi possível ler apikey.txt: {e}")


# Mostra no localhost:8000 se deu certo a execução do Python + Java
@app.get("/")
def home():
    return {
        "status": "Sistema Paiva IA Online",
        "motor_ativo": "Gemini 2.5 Flash"
    }

# Config da identidade (persona e estruturação da resposta e conexão com o modelo) da IA
@app.post("/analisar")
async def analisar_imagem(image: UploadFile = File(...)):
    try:
        # leitura dos bits da imagem que o Java enviou + visão da imagem pelo Python
        conteudo_imagem = await image.read()
        imagem_pillow = Image.open(io.BytesIO(conteudo_imagem))

        prompt = """
        Você é o motor de inteligência do Sistema Paiva, uma plataforma de análise forense de alto nível.
        Analise a imagem enviada e forneça um relatório estruturado contendo:
        1. IDENTIFICAÇÃO: O que é o objeto ou cena principal.
        2. CONTEXTO: Descrição detalhada do ambiente.
        3. ANOMALIAS: Identifique qualquer elemento suspeito, irregular ou fora do comum.
        4. CONCLUSÃO: Um parecer técnico resumido sobre a imagem.
        
        Use um tom profissional, imparcial e extremamente detalhado.
        """

        # Chamada multimodal (texto + imagem) -> enviamos a instrução e a foto para o Google
        response = client.models.generate_content(model="gemini-2.5-flash", contents=[prompt, imagem_pillow])

        # Devolução da análise para o Java
        return {"Análise": response.text}
    
    except Exception as e:
        print(f"ERRO NA ANÁLISE: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno no motor de IA: {str(e)}")
