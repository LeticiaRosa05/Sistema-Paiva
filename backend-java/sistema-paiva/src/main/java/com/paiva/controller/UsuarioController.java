package com.paiva.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import com.paiva.repository.AnaliseRepository;
import com.paiva.service.UsuarioService;
import com.paiva.service.AIService;
import com.paiva.model.Analise;
import com.paiva.model.Usuario;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private AnaliseRepository repository;
    private final AIService aiService;
    private UsuarioService service;
    
    public UsuarioController (UsuarioService service, AIService aiService, AnaliseRepository repository) {
        this.repository = repository;
        this.aiService = aiService;
        this.service = service;
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

        // busca o ID do usuário que pediu a análise, cria um objeto análise vinculado à ele e então atribui o objeto ao retorno da análise. Por fim salva o objeto vinculado ao usuario no banco
        Usuario usuarioEncontrado = service.buscarPorId(id);
        if (usuarioEncontrado == null) {
            return "ERRO: usuário não encontrado";
        } else {
            Analise analise = new Analise(usuarioEncontrado);
            analise.setAnalise_IA(resultadoImagem);
            repository.save(analise);
        }

        return "A imagem " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)" + " do usuário " + id + "foi recebida. Resposta da análise: " + resultadoImagem;
    }
}
