package com.paiva.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.paiva.service.UsuarioService;
import com.paiva.model.Usuario;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    private UsuarioService service;

    public UsuarioController (UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    public Usuario criarUsuario(@RequestBody Usuario usuario) {
        return service.salvarUsuario(usuario);
    }
    
    @PostMapping("/upload-teste")
    public String testarUpload(@RequestParam("image") org.springframework.web.multipart.MultipartFile file) {
        return "Recebi o arquivo" + file.getOriginalFilename() + " (" + file.getSize() + " bytes)";
    }
    
}
