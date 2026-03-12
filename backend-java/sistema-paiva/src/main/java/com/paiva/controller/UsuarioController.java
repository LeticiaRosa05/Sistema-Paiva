package com.paiva.controller;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import com.paiva.repository.AnaliseRepository;
import com.paiva.service.UsuarioService;
import com.paiva.service.AIService;
import com.paiva.model.Analise;
import com.paiva.model.Usuario;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private PasswordEncoder passwordEncoder;
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
        String senhaCriptografada = passwordEncoder.encode(usuario.getSenha()); // criptografa a senha do usuário para salvar com o restante dos dados
        usuario.setSenha(senhaCriptografada);
        return service.salvarUsuario(usuario);
    }
    
    @PostMapping("/{id}/analisar")
    // Pede ao java o id de usuário presente na url e coloca na variável id; pede para que o Java procure no corpo da requisição um campo "file" que contenha um arquivo
    public String uploadArquivo(@PathVariable Long id, @RequestParam MultipartFile file) throws Exception {
        // envia o arquivo e guarda a resposta do Python em resultadoAnalise
        String resultadoAnalise = aiService.chamarIA(file);

        // busca o ID do usuário que pediu a análise, cria um objeto análise vinculado à ele e então atribui o objeto ao retorno da análise. Por fim salva o objeto vinculado ao usuario no banco
        Usuario usuarioEncontrado = service.buscarPorId(id);
        if (usuarioEncontrado == null) {
            return "ERRO: usuário não encontrado";
        } else {
            Analise analise = new Analise(usuarioEncontrado);
            analise.setAnalise_IA(resultadoAnalise);
            repository.save(analise);
        }

        return "O arquivo " + file.getOriginalFilename() + " (" + file.getSize() + " bytes) do usuário " + id + " foi recebido. Resposta da análise: " + resultadoAnalise;
    }
}
