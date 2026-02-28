package com.paiva.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.paiva.repository.MensagemRepository;
import com.paiva.service.MensagemService;
import com.paiva.model.ChatRequest;
import com.paiva.service.AIService;
import com.paiva.model.Mensagem;
import com.paiva.model.Analise;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analises")
public class ChatController {

    private MensagemRepository repository;
    private MensagemService service;
    private AIService aiService;


    public ChatController(MensagemService service, MensagemRepository repository, AIService aiService) {
        this.repository = repository;
        this.aiService = aiService;
        this.service = service;
    }

    @PostMapping("/{analiseId}/chat")
    public String criarChat(@PathVariable Long analiseId, @RequestBody ChatRequest request) {
        // Busca pela análise que originou o chat
        Analise analise = service.buscarPorId(analiseId);
        if (analise == null) {
            return "ERRO: análise inexistente";
        } else {
            // Salva a mensagem/pergunta do usuário no banco
            Mensagem msgUsuario = new Mensagem(analise, request.mensagemUsuario(), "user");
            repository.save(msgUsuario);

            // Busca o histórico pra dar contexto pra IA pelo MensagemRepository
            List<Mensagem> historico = repository.findByAnaliseIdOrderByHoraMensagemAsc(analiseId);

            // Monta o JSON/payload pro Python
            Map<String, Object> payload = new HashMap<>();
            payload.put("laudo_origem", analise.getAnalise_IA());
            payload.put("mensagem_atual", request.mensagemUsuario());

            // Organiza a lista de mensagens para a IA
            List<Map<String, String>> historicoFormatado = historico.stream().map(m -> {
                Map<String, String> item = new HashMap<>();
                item.put("role", m.getOrigemRemetente().equals("user") ? "user" : "model");
                item.put("parts", m.getTexto_mensagem());
                return item;
            }).toList();
            payload.put("historico", historicoFormatado);

            // Chama o Python e pega a reposta dele e então salva a resposta da IA no banco
            String respostaIA = aiService.chamarChat(payload);
            Mensagem msgIA = new Mensagem(analise, respostaIA, "model");
            repository.save(msgIA);

            return respostaIA;
        }
    }
}
