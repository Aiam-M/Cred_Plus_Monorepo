package com.projeto.amazonhacking.infra.seed;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.projeto.amazonhacking.models.Associacao;
import com.projeto.amazonhacking.models.Empresa;
import com.projeto.amazonhacking.models.Plantacao;
import com.projeto.amazonhacking.models.Safra;
import com.projeto.amazonhacking.models.Usuario;
import com.projeto.amazonhacking.models.UsuarioRole;
import com.projeto.amazonhacking.repository.AssociacaoRepository;
import com.projeto.amazonhacking.repository.EmpresaRepository;
import com.projeto.amazonhacking.repository.PlantacaoRepository;
import com.projeto.amazonhacking.repository.SafraRepository;
import com.projeto.amazonhacking.repository.UsuarioRepository;
import com.projeto.amazonhacking.services.TraceabilityService;

/**
 * Popula o banco com dados de demonstração (associação de Jutaiteua, produtores,
 * empresa de teste, safras, plantações e cadeia de rastreabilidade).
 *
 * Só roda quando a propriedade seed.enabled=true está definida — por isso NÃO
 * executa em produção por padrão. É idempotente: se a empresa de teste já existir,
 * não faz nada (evita duplicar dados a cada reinício).
 *
 * Os eventos de rastreabilidade são criados pelo TraceabilityService, então os
 * hashes SHA-256 encadeados são reais e passam na verificação de integridade.
 */
@Component
@ConditionalOnProperty(name = "seed.enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private static final String EMAIL_EMPRESA_TESTE = "empresa@cred.com";
    private static final String SENHA_EMPRESA_TESTE = "empresa123";
    private static final String SENHA_PRODUTOR_PADRAO = "produtor123";

    private final AssociacaoRepository associacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final SafraRepository safraRepository;
    private final PlantacaoRepository plantacaoRepository;
    private final TraceabilityService traceabilityService;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AssociacaoRepository associacaoRepository,
                      UsuarioRepository usuarioRepository,
                      EmpresaRepository empresaRepository,
                      SafraRepository safraRepository,
                      PlantacaoRepository plantacaoRepository,
                      TraceabilityService traceabilityService,
                      PasswordEncoder passwordEncoder) {
        this.associacaoRepository = associacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.safraRepository = safraRepository;
        this.plantacaoRepository = plantacaoRepository;
        this.traceabilityService = traceabilityService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (empresaRepository.existsByEmail(EMAIL_EMPRESA_TESTE)) {
            log.info("Seed ignorado: dados de demonstração já existem.");
            return;
        }

        log.info("Iniciando seed de dados de demonstração...");

        Associacao jutaiteua = criarAssociacao();
        criarEmpresaTeste();

        Usuario joao = criarProdutor("João da Silva", "joao@jutaiteua.org", jutaiteua.getId());
        Usuario maria = criarProdutor("Maria Santos", "maria@jutaiteua.org", jutaiteua.getId());
        Usuario pedro = criarProdutor("Pedro Oliveira", "pedro@jutaiteua.org", jutaiteua.getId());
        Usuario ana = criarProdutor("Ana Costa", "ana@jutaiteua.org", jutaiteua.getId());
        Usuario raimunda = criarProdutor("Raimunda Lima", "raimunda@jutaiteua.org", jutaiteua.getId());
        Usuario antonio = criarProdutor("Antônio Melo", "antonio@jutaiteua.org", jutaiteua.getId());

        // Safra 1 — validada (cadastro + satélite + campo)
        Safra s1 = criarSafra(joao, "Safra Cacau-Açaí 2025", 12.5, "VALIDADA", 92,
                LocalDateTime.of(2026, 4, 5, 16, 45), LocalDateTime.of(2026, 4, 10, 14, 30));
        criarPlantacao(s1, "CACAU", 500);
        criarPlantacao(s1, "ACAI", 300);
        eventoCadastro(s1, joao, 12.5, "Cacau: 500kg, Açaí: 300kg", 5, LocalDateTime.of(2026, 4, 5, 16, 45));
        eventoSatelite(s1, 0.78, 92, "38%", LocalDateTime.of(2026, 4, 8, 10, 15));
        eventoCampo(s1, joao, LocalDateTime.of(2026, 4, 10, 14, 30));

        // Safra 2 — ativa (cadastro + satélite)
        Safra s2 = criarSafra(maria, "Safra Açaí Várzea 2025", 8.4, "ATIVA", 88,
                LocalDateTime.of(2026, 4, 3, 10, 0), null);
        criarPlantacao(s2, "ACAI", 800);
        criarPlantacao(s2, "MANDIOCA", 1200);
        eventoCadastro(s2, maria, 8.4, "Açaí: 800kg, Mandioca: 1200kg", 4, LocalDateTime.of(2026, 4, 3, 10, 0));
        eventoSatelite(s2, 0.75, 88, "32%", LocalDateTime.of(2026, 4, 4, 4, 20));

        // Safra 3 — validada
        Safra s3 = criarSafra(pedro, "Safra Mandioca Agroflorestal", 15.2, "VALIDADA", 94,
                LocalDateTime.of(2026, 3, 28, 9, 30), LocalDateTime.of(2026, 4, 2, 11, 0));
        criarPlantacao(s3, "MANDIOCA", 2000);
        criarPlantacao(s3, "CACAU", 400);
        eventoCadastro(s3, pedro, 15.2, "Mandioca: 2000kg, Cacau: 400kg", 15, LocalDateTime.of(2026, 3, 28, 9, 30));
        eventoSatelite(s3, 0.82, 94, "42%", LocalDateTime.of(2026, 3, 29, 2, 10));
        eventoCampo(s3, pedro, LocalDateTime.of(2026, 4, 2, 11, 0));

        // Safra 4 — ativa
        Safra s4 = criarSafra(ana, "Safra Cupuaçu 2025", 6.8, "ATIVA", 79,
                LocalDateTime.of(2026, 3, 20, 14, 0), null);
        criarPlantacao(s4, "ACAI", 600);
        criarPlantacao(s4, "MANDIOCA", 900);
        eventoCadastro(s4, ana, 6.8, "Açaí: 600kg, Mandioca: 900kg", 6, LocalDateTime.of(2026, 3, 20, 14, 0));
        eventoSatelite(s4, 0.72, 79, "30%", LocalDateTime.of(2026, 3, 21, 5, 30));

        // Safra 5 — validada
        Safra s5 = criarSafra(raimunda, "Safra Cacau Tradicional", 10.1, "VALIDADA", 91,
                LocalDateTime.of(2026, 3, 15, 7, 30), LocalDateTime.of(2026, 3, 22, 16, 0));
        criarPlantacao(s5, "CACAU", 720);
        eventoCadastro(s5, raimunda, 10.1, "Cacau: 720kg", 4, LocalDateTime.of(2026, 3, 15, 7, 30));
        eventoSatelite(s5, 0.77, 91, "34%", LocalDateTime.of(2026, 3, 16, 3, 45));
        eventoCampo(s5, raimunda, LocalDateTime.of(2026, 3, 22, 16, 0));

        // Safra 6 — reprovada (cadastro + satélite + reprovação)
        Safra s6 = criarSafra(antonio, "Safra Cacau Experimental", 2.1, "REPROVADA", 48,
                LocalDateTime.of(2026, 3, 10, 9, 0), null);
        criarPlantacao(s6, "CACAU", 90);
        eventoCadastro(s6, antonio, 2.1, "Cacau: 90kg", 2, LocalDateTime.of(2026, 3, 10, 9, 0));
        eventoSatelite(s6, 0.63, 48, "15%", LocalDateTime.of(2026, 3, 11, 5, 20));
        eventoReprovacao(s6, LocalDateTime.of(2026, 3, 14, 10, 0));

        log.info("Seed concluído: 1 associação, 6 produtores, 1 empresa de teste e 6 safras.");
    }

    private Associacao criarAssociacao() {
        Associacao a = new Associacao();
        a.setNome("Associação dos Agricultores Familiares de Jutaiteua");
        a.setCnpj("11222333000181");
        a.setDescricao("Comunidade de agricultura familiar regenerativa em Moju-PA");
        a.setLatitude(-2.415);
        a.setLongitude(-49.172);
        a.setAreaTotalHectares(1234.5);
        a.setMunicipio("Moju");
        a.setEstado("PA");
        return associacaoRepository.save(a);
    }

    private void criarEmpresaTeste() {
        Empresa empresa = new Empresa(
                "12345678000190",
                EMAIL_EMPRESA_TESTE,
                passwordEncoder.encode(SENHA_EMPRESA_TESTE),
                "Cacau e derivados");
        empresaRepository.save(empresa);
    }

    private Usuario criarProdutor(String nome, String email, int associacaoId) {
        Usuario produtor = new Usuario(
                nome, email, passwordEncoder.encode(SENHA_PRODUTOR_PADRAO), associacaoId, UsuarioRole.USER);
        return usuarioRepository.save(produtor);
    }

    private Safra criarSafra(Usuario produtor, String nome, double area, String status, int score,
                             LocalDateTime criadaEm, LocalDateTime validadaEm) {
        Safra safra = new Safra();
        safra.setProdutor(produtor);
        safra.setName(nome);
        safra.setAreaPlantacao(area);
        safra.setStatus(status);
        safra.setAgroScore(score);
        safra.setCreatedAt(criadaEm);
        safra.setValidadaEm(validadaEm);
        return safraRepository.save(safra);
    }

    private void criarPlantacao(Safra safra, String tipo, double quantidade) {
        Plantacao plantacao = new Plantacao();
        plantacao.setSafra(safra);
        plantacao.setTipo(tipo);
        plantacao.setQuantidade(quantidade);
        plantacao.setUnidade("KG");
        plantacaoRepository.save(plantacao);
    }

    private void eventoCadastro(Safra safra, Usuario produtor, double area, String plantacoesTexto,
                                int imagens, LocalDateTime data) {
        traceabilityService.criarEvento(safra, "CADASTRO_INICIAL",
                dados("areaHectares", area, "plantacoes", plantacoesTexto, "imagensAnexadas", imagens),
                produtor.getNome(), "PRODUTOR",
                "Safra cadastrada via app mobile e sincronizada.", data);
    }

    private void eventoSatelite(Safra safra, double ndvi, int score, String floresta, LocalDateTime data) {
        traceabilityService.criarEvento(safra, "VALIDACAO_SATELITE",
                dados("ndviMedio", ndvi, "agroScore", score, "florestaNativa", floresta, "alertasDesmatamento", 0),
                "Sistema GEE (Automático)", "SISTEMA",
                "Análise de dados de satélite concluída.", data);
    }

    private void eventoCampo(Safra safra, Usuario produtor, LocalDateTime data) {
        traceabilityService.criarEvento(safra, "VALIDACAO_CAMPO",
                dados("localVisitado", "Jutaiteua, Moju-PA", "fotosColetadas", 6, "entrevistado", produtor.getNome()),
                "Amazon People (Validador)", "VALIDADOR",
                "Safra confere com o cadastro. Práticas sustentáveis confirmadas.", data);
    }

    private void eventoReprovacao(Safra safra, LocalDateTime data) {
        traceabilityService.criarEvento(safra, "REPROVACAO",
                dados("motivo", "AgroScore < 60 e floresta < 20%", "prazoReenvio", "2026-06-12"),
                "Sistema Cred+", "SISTEMA",
                "Safra reprovada automaticamente por não atender aos requisitos EUDR mínimos.", data);
    }

    // Monta um mapa ordenado de dados do evento a partir de pares chave/valor.
    private Map<String, Object> dados(Object... pares) {
        Map<String, Object> mapa = new LinkedHashMap<>();
        for (int i = 0; i + 1 < pares.length; i += 2) {
            mapa.put((String) pares[i], pares[i + 1]);
        }
        return mapa;
    }
}
