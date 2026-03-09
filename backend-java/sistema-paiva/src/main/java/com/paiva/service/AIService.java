package com.paiva.service;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.stereotype.Service;
import org.springframework.http.MediaType;
import org.springframework.http.*;
import java.util.Map;

@Service
public class AIService {
    private final RestTemplate restTemplate;

    public AIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Recebe o arquivo que veio do Controller
    public String chamarIA(MultipartFile file) throws Exception {
        String urlPython = "http://localhost:8000/analisar";

        // Define o envio do arquivo como campos de formulário em vez de um texto simples
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        HttpHeaders headers = new HttpHeaders();
        // Define que um formulário com arquivo está sendo enviado
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // Envia de fato para o Python e aguarda a resposta
        ResponseEntity<String> response = restTemplate.postForEntity(urlPython, requestEntity, String.class);
        return response.getBody();
    }

    public String chamarChat(Map<String, Object> payload) {
        String url = "http://localhost:8000/chat"; // novo endpoint de sessão de chat
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.postForObject(url, payload, String.class);
    }
}
 
