from fastapi import FastAPI, UploadFile, File, HTTPException
from google.genai import types
from pydantic import BaseModel
from google import genai
from datetime import datetime
import PIL.Image
import io

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

# Modelo de chat para receber do Java
class ChatPayload(BaseModel):
    laudo_origem: str
    historico: list
    mensagem_atual: str

# Config da identidade (persona e estruturação da resposta e conexão com o modelo) da IA
@app.post("/analisar")
async def analisar_arquivo(file: UploadFile = File(...)):
    data_hoje = datetime.now().strftime("%d/%m/%Y")
    try:
        # leitura dos bits do arquivo recebido do Java
        conteudo_arquivo = await file.read()

        # Identifica o tipo de arquivo
        mime_type = file.content_type

        # Inicialização do dicionário e prompt para enviar os bytes para o Python/IA
        documento_para_ia = []
        prompt = ""

        if mime_type.startswith("image/"):
            imagem_pillow = PIL.Image.open(io.BytesIO(conteudo_arquivo))
            documento_para_ia = [imagem_pillow]
            prompt = f"""
            USE A DATA {data_hoje} COMO A DATA DA ANÁLISE A SEGUIR, ignore datas de criação de arquivos para fins de datação do laudo atual.
            Você é o motor de inteligência do Sistema Paiva, uma plataforma de análise forense de alto nível.
            Analise a imagem enviada e forneça um relatório estruturado contendo:
            1. IDENTIFICAÇÃO: O que é o objeto ou cena principal.
            2. CONTEXTO: Descrição detalhada do ambiente.
            3. ANOMALIAS: Identifique qualquer elemento suspeito, irregular ou fora do comum.
            4. CONCLUSÃO: Um parecer técnico resumido sobre a imagem.
            
            Use um tom profissional, imparcial e extremamente detalhado.
            """
        elif mime_type.startswith("audio/"):
            parte_audio = types.Part.from_bytes(data=conteudo_arquivo, mime_type="audio/mpeg")
            documento_para_ia = [parte_audio]
            prompt = f"""
            USE A DATA {data_hoje} COMO A DATA DA ANÁLISE A SEGUIR, ignore datas de criação de arquivos para fins de datação do laudo atual.
            Você é o motor de inteligência do Sistema Paiva, uma plataforma de análise forense de alto nível.
            Ouça este áudio e forneça um relatório estruturado, análise de tom e identifique pontos suspeitos, contendo:
            1. IDENTIFICAÇÃO: O que é o acontecimento ou cena principal descrita.
            2. CONTEXTO: Descrição detalhada do que o áudio insinua ou defende.
            3. ANOMALIAS: Identifique qualquer elemento suspeito, irregular ou fora do comum.
            4. CONCLUSÃO: Um parecer técnico resumido sobre o áudio.
            
            Use um tom profissional, imparcial e extremamente detalhado.
            """
        elif mime_type == "application/pdf":
            parte_pdf = types.Part.from_bytes(data=conteudo_arquivo, mime_type="application/pdf")
            documento_para_ia = [parte_pdf]
            prompt = f"""
            USE A DATA {data_hoje} COMO A DATA DA ANÁLISE A SEGUIR, ignore datas de criação de arquivos para fins de datação do laudo atual.
            Você é o motor de inteligência do Sistema Paiva, uma plataforma de análise forense de alto nível.
            Analise este documento buscando rasuras ou inconsistências e forneça um relatório estruturado, contendo:
            1. IDENTIFICAÇÃO: Do que se trata o documento e se ele possui dados sensíveis.
            2. CONTEXTO: Descrição detalhada do âmbito em que o documento se encaixa.
            3. ANOMALIAS: Identifique qualquer elemento suspeito, irregular ou fora do comum.
            4. CONCLUSÃO: Um parecer técnico resumido sobre o áudio.
            
            Use um tom profissional, imparcial e extremamente detalhado.
            """
        else:
            raise HTTPException(status_code=400, detail=f"Arquivo {mime_type} não suportado.")

        # Chamada multimodal (texto + imagem) -> enviamos a instrução e a foto para o Google
        response = client.models.generate_content(model="gemini-2.5-flash", contents=[prompt, *documento_para_ia])

        # Devolução da análise para o Java
        return {"Análise": response.text}
    
    except Exception as e:
        print(f"ERRO NA ANÁLISE: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno no motor de IA: {str(e)}")

# Endpoint do chat
@app.post("/chat")
async def chat(payload: ChatPayload):
    data_hoje = dt.now().strftime("%d/%m/%Y")
    try:
        instrucao_sistema = f"""
        USE A DATA {data_hoje} COMO A DATA DA ANÁLISE A SEGUIR, ignore datas de criação de arquivos para fins de datação do laudo atual. 
        Você é o assistente de inteligência do Sistema Paiva, uma plataforma de análise forense de alto nível.
        O seu laudo técnico original foi este: {payload.laudo_origem}
        Responda às perguntas do usuário baseando-se nos dados deste laudo e no histórico da conversa abaixo. Seja técnico e preciso. Não se prenda somente nos dados literais que você descreveu no laudo, mas faça uma reanálise caso seja necessário para providenciar informações mais precisas, mantendo a fidelidade ao arquivo providenciado.
        """

        mensagens_gemini = []
        for msg in payload.historico:
            mensagens_gemini.append({
                "role": msg['role'],
                "parts": [{"text": msg['parts']}]
            })
        
        mensagens_gemini.append({
            "role": "user",
            "parts": [{"text": payload.mensagem_atual}]
        })

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(system_instruction=instrucao_sistema),
            contents=mensagens_gemini
        )

        return response.text
    except Exception as e:
        print(f"ERRO DE CHAT: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
