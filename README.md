# Sistema Paiva
O sistema é composto de uma stack com núcleos de IA de análise de dados, envoltos por um sistema em Java que utiliza um banco PostgreeSQL, a partir de um docker.

**O sistema faz uso da placa de vídeo do computador para processamento multimodal durante a execução do Python**

# Como executar

- Abrir o Docker Desktop e rodar 'docker compose up -d' no terminal do VS Code dentro da pasta root do repositório 'sistema-paiva'
- Executar o run no backend-java\sistema-paiva\src\main\java\com\paiva\SistemaPaivaApplication.java
- Depois, executar 'uvicorn main:app --reload --port 8000' no VS Code na pasta 'service-ai', para rodar o Python (teste pra ver se o Python ta enxergando a placa de vídeo)
- Abrir no navegador http://localhost:8000/ e conferir se está true o gpu_ativa
- Para conferir se o WSL está reconhecendo a placa, abrir o WSL e executar nvidia-smi -> deve abrir uma tabela com as informações da placa de vídeo

Para limpar o cache de compilação do Java -> Ctrl + C no terminal de debug e após ./mvnw clean, e aí restartar
