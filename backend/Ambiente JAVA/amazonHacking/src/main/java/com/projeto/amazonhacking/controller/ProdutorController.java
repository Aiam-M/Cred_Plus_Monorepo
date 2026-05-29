package com.projeto.amazonhacking.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.projeto.amazonhacking.dto.imagem.SafraImagemDTO;
import com.projeto.amazonhacking.dto.interesse.GetInteresseProdutorDTO;
import com.projeto.amazonhacking.dto.produtor.GetProdutorMeDTO;
import com.projeto.amazonhacking.dto.safra.GetSafraDTO;
import com.projeto.amazonhacking.models.Associacao;
import com.projeto.amazonhacking.models.Usuario;
import com.projeto.amazonhacking.repository.UsuarioRepository;
import com.projeto.amazonhacking.services.ImagemService;
import com.projeto.amazonhacking.services.InteresseService;
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
    private final ImagemService imagemService;
    private final InteresseService interesseService;

    public ProdutorController(SafraService safraService,
                              UsuarioRepository usuarioRepository,
                              ImagemService imagemService,
                              InteresseService interesseService) {
        this.safraService = safraService;
        this.usuarioRepository = usuarioRepository;
        this.imagemService = imagemService;
        this.interesseService = interesseService;
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

    /**
     * Anexa uma foto a uma safra do próprio produtor.
     * Recebe o arquivo como multipart/form-data no campo "arquivo".
     * Se a safra for de outro produtor, responde 404 (não revela que ela existe).
     */
    @PostMapping("/safras/{safraId}/imagens")
    public ResponseEntity<SafraImagemDTO> enviarImagem(
            @PathVariable Integer safraId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @AuthenticationPrincipal Usuario produtor) {
        SafraImagemDTO criada = imagemService.fazerUpload(safraId, produtor, arquivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    /**
     * Lista as mensagens de interesse recebidas pelo produtor autenticado
     * (de qualquer uma de suas safras), das mais recentes para as mais antigas.
     */
    @GetMapping("/interesses")
    public ResponseEntity<List<GetInteresseProdutorDTO>> listarInteresses(
            @AuthenticationPrincipal Usuario produtor) {
        return ResponseEntity.ok(interesseService.listarPorProdutor(produtor.getId()));
    }

    /**
     * Conta as mensagens não lidas. Usado no Dashboard como badge de "novas mensagens".
     * Resposta: {"naoLidos": N}.
     */
    @GetMapping("/interesses/contagem-nao-lidos")
    public ResponseEntity<Map<String, Long>> contarNaoLidos(
            @AuthenticationPrincipal Usuario produtor) {
        long total = interesseService.contarNaoLidos(produtor.getId());
        return ResponseEntity.ok(Map.of("naoLidos", total));
    }

    /**
     * Marca uma mensagem como lida.
     * Se o interesse não pertencer a uma safra do produtor, responde 404
     * (não revela que ele existe — proteção contra IDOR).
     */
    @PatchMapping("/interesses/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(
            @PathVariable Integer id,
            @AuthenticationPrincipal Usuario produtor) {
        interesseService.marcarComoLida(id, produtor.getId());
        return ResponseEntity.noContent().build();
    }
}
