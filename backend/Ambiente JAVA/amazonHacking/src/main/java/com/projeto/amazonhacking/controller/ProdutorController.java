package com.projeto.amazonhacking.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projeto.amazonhacking.dto.produtor.GetProdutorMeDTO;
import com.projeto.amazonhacking.dto.safra.GetSafraDTO;
import com.projeto.amazonhacking.models.Associacao;
import com.projeto.amazonhacking.models.Usuario;
import com.projeto.amazonhacking.repository.UsuarioRepository;
import com.projeto.amazonhacking.services.SafraService;

/**
 * Endpoints do app do produtor para consultar as PRÓPRIAS safras.
 * Caminho completo (com context-path): /cred/produtor/...
 * Exige ROLE_USER (configurado no SecurityConfigurations).
 *
 * Observação importante de arquitetura: o app lê as safras daqui (do banco),
 * e não direto do IndexedDB. O IndexedDB é só o cache offline; a fonte da
 * verdade é o backend.
 */
@RestController
@RequestMapping("/produtor")
public class ProdutorController {

    private final SafraService safraService;
    private final UsuarioRepository usuarioRepository;

    public ProdutorController(SafraService safraService, UsuarioRepository usuarioRepository) {
        this.safraService = safraService;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Retorna os dados do perfil do produtor autenticado.
     * Usado pelo app mobile para exibir nome e associação reais em vez de dados mockados.
     *
     * Nota: usamos findWithAssociacaoById() em vez de produtor.getAssociacao() porque
     * open-in-view=false impede lazy loading fora de uma transação ativa.
     * O @EntityGraph no repository carrega a associação junto na mesma query.
     */
    @GetMapping("/me")
    public ResponseEntity<GetProdutorMeDTO> meuPerfil(@AuthenticationPrincipal Usuario produtor) {
        // Recarrega o produtor com a associação já incluída (evita LazyInitializationException).
        Usuario produtorComAssociacao = usuarioRepository
                .findWithAssociacaoById(produtor.getId())
                .orElse(produtor);

        Associacao associacao = produtorComAssociacao.getAssociacao();

        // A associação pode ser null se o produtor foi criado sem associação válida.
        // Nesse caso, retornamos strings vazias para não quebrar o app.
        String nomeAssociacao = associacao != null ? associacao.getNome() : "";
        String municipio      = associacao != null ? associacao.getMunicipio() : "";
        String estado         = associacao != null ? associacao.getEstado() : "";

        GetProdutorMeDTO dto = new GetProdutorMeDTO(
                produtorComAssociacao.getId().toString(),
                produtorComAssociacao.getNome(),
                produtorComAssociacao.getEmail(),
                produtorComAssociacao.getRole().name(),
                produtorComAssociacao.getAssociacaoId(),
                nomeAssociacao,
                municipio,
                estado
        );

        return ResponseEntity.ok(dto);
    }

    /**
     * Lista as safras do produtor autenticado.
     */
    @GetMapping("/safras")
    public ResponseEntity<List<GetSafraDTO>> listarSafras(@AuthenticationPrincipal Usuario produtor) {
        return ResponseEntity.ok(safraService.listarPorProdutor(produtor.getId()));
    }

    /**
     * Detalhe de uma safra do produtor autenticado.
     * Se a safra for de outro produtor, responde 404 (não revela que ela existe).
     */
    @GetMapping("/safras/{id}")
    public ResponseEntity<GetSafraDTO> buscarSafra(
            @PathVariable Integer id,
            @AuthenticationPrincipal Usuario produtor) {
        return ResponseEntity.ok(safraService.buscarDoProdutor(id, produtor.getId()));
    }
}
