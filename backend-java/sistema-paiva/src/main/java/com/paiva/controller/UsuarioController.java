package com.paiva.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.paiva.service.AIService;
import com.paiva.service.UsuarioService;
import com.paiva.model.Usuario;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    private UsuarioService service;
    private final AIService aiService;

    public UsuarioController (UsuarioService service, AIService aiService) {
        this.service = service;
        this.aiService = aiService;
    }

    @PostMapping
    public Usuario criarUsuario(@RequestBody Usuario usuario) {
        return service.salvarUsuario(usuario);
    }
    
    @PostMapping("/{id}/foto")
    // Pede ao java o id de usuário presente na url e coloca na variável id; pede para que o Java procure no corpo da requisição um campo "image" que contenha um arquivo
    public String uploadFoto(@PathVariable Long id, @RequestParam("image") MultipartFile file) throws Exception {
        // envia o arquivo e guarda a resposta do Python em resultadoImagem
        String resultadoImagem = aiService.chamarIA(file);
        return "A imagem " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)" + " do usuário " + id + "foi recebida. Resposta da análise: " + resultadoImagem;
    }
}
