package com.paiva.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.paiva.repository.AnaliseRepository;
import com.paiva.service.UsuarioService;
import com.paiva.service.AIService;
import com.paiva.model.Analise;
import com.paiva.model.Usuario;
import java.util.List;

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
    
    @PostMapping("/analisar")
    // Pede para que o Java procure no corpo da requisição um campo "file" que contenha um arquivo
    public ResponseEntity<Analise> uploadArquivo(@RequestParam MultipartFile file) throws Exception {
        var usuarioLogado = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal(); // Busca quem é o usuário ativo para atribuir à ele a nova análise

        String resultadoAnalise = aiService.chamarIA(file);
        Analise analise = new Analise(usuarioLogado);
        analise.setAnalise_IA(resultadoAnalise);
        repository.save(analise);

        return ResponseEntity.ok(analise);
    }

    @Transactional
    @DeleteMapping("/minha-conta")
    public ResponseEntity<Void> excluirMinhaConta() {
        var usuarioLogado = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        service.excluirUsuario(usuarioLogado.getId()); // usa o método do UsuarioService para apagar os dados do usuário
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/analises")
    public List<Analise> analisesUsuario() {
        var usuarioLogado = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return repository.findByUsuarioId(usuarioLogado.getId());
    }

    @DeleteMapping("/analises/{id}")
    @Transactional // garante a exclusão em cascata da análise - mensagens
    public ResponseEntity<Void> excluirAnalise(@PathVariable Long id) {
        var usuarioLogado = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var analise = repository.findById(id);

        // exclui a análise do usuário que solicitou a exclusão
        if (analise.isPresent() && analise.get().getUsuario().getId().equals(usuarioLogado.getId())) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/analises/{id}/titulo")
    public ResponseEntity<Analise> renomearAnalise(@PathVariable Long id, @RequestBody String novoTitulo) {
        var usuarioLogado = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var analiseOpt = repository.findById(id);

        if (analiseOpt.isPresent()) {
            Analise analise = analiseOpt.get();
            if (analise.getUsuario().getId().equals(usuarioLogado.getId())) {
                analise.setTitulo(novoTitulo.replace("\"", ""));
                repository.save(analise);
                return ResponseEntity.ok(analise);
            }
        }
        return ResponseEntity.notFound().build();
    }
}
