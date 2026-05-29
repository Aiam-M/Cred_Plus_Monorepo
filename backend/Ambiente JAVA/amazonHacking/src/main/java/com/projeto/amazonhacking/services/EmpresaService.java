package com.projeto.amazonhacking.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

import com.projeto.amazonhacking.dto.empresa.AlterarSenhaDTO;
import com.projeto.amazonhacking.dto.empresa.EmpresaAtualizarDTO;
import com.projeto.amazonhacking.dto.empresa.EmpresaCadastroDTO;
import com.projeto.amazonhacking.dto.empresa.GetEmpresaDTO;
import com.projeto.amazonhacking.infra.exception.ValidacaoException;
import com.projeto.amazonhacking.models.Empresa;
import com.projeto.amazonhacking.repository.EmpresaRepository;

/**
 * Regras de negócio das empresas compradoras.
 */
@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;

    public EmpresaService(EmpresaRepository empresaRepository, PasswordEncoder passwordEncoder) {
        this.empresaRepository = empresaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Cadastra uma nova empresa no sistema.
     * @param dto dados da empresa (CNPJ, email, senha e segmento)
     * @return dados da empresa criada, sem a senha
     * @throws ValidacaoException se o email ou o CNPJ já estiverem cadastrados
     */
    public GetEmpresaDTO cadastrar(EmpresaCadastroDTO dto) {
        // Validações primeiro: garante unicidade antes de gravar.
        if (!cnpjValido(dto.cnpj())) {
            throw new ValidacaoException("CNPJ inválido");
        }
        if (empresaRepository.existsByEmail(dto.email())) {
            throw new ValidacaoException("Email já cadastrado");
        }
        if (empresaRepository.existsByCnpj(dto.cnpj())) {
            throw new ValidacaoException("CNPJ já cadastrado");
        }

        // A senha nunca é gravada em texto puro: sempre codificada com BCrypt.
        String senhaCodificada = passwordEncoder.encode(dto.password());
        Empresa empresa = new Empresa(dto.nome(), dto.cnpj(), dto.email(), senhaCodificada, dto.segmento());
        empresaRepository.save(empresa);

        return new GetEmpresaDTO(empresa.getId(), empresa.getNome(), empresa.getCnpj(), empresa.getEmail(), empresa.getSegmento());
    }

    /**
     * Atualiza os dados cadastrais da empresa autenticada (nome, segmento, e-mail).
     * O CNPJ é imutável e nunca é alterado por este método.
     * @param empresaId ID da empresa autenticada (do SecurityContext)
     * @param dto       novos dados
     * @return dados atualizados
     * @throws ValidacaoException se o novo e-mail já estiver em uso por outra empresa
     */
    public GetEmpresaDTO atualizarDados(UUID empresaId, EmpresaAtualizarDTO dto) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ValidacaoException("Empresa não encontrada"));

        // Verifica unicidade do e-mail apenas se ele realmente mudou.
        if (!empresa.getEmail().equalsIgnoreCase(dto.email())
                && empresaRepository.existsByEmail(dto.email())) {
            throw new ValidacaoException("E-mail já está em uso por outra empresa");
        }

        empresa.setNome(dto.nome());
        empresa.setSegmento(dto.segmento());
        empresa.setEmail(dto.email());
        empresaRepository.save(empresa);

        return new GetEmpresaDTO(empresa.getId(), empresa.getNome(), empresa.getCnpj(), empresa.getEmail(), empresa.getSegmento());
    }

    /**
     * Altera a senha da empresa autenticada, exigindo confirmação da senha atual.
     * @param empresaId  ID da empresa autenticada
     * @param dto        senhaAtual (para verificar) e novaSenha
     * @throws ValidacaoException se a senha atual estiver incorreta
     */
    public void alterarSenha(UUID empresaId, AlterarSenhaDTO dto) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ValidacaoException("Empresa não encontrada"));

        if (!passwordEncoder.matches(dto.senhaAtual(), empresa.getPasswordHash())) {
            throw new ValidacaoException("Senha atual incorreta");
        }

        empresa.setPasswordHash(passwordEncoder.encode(dto.novaSenha()));
        // Invalida os tokens emitidos antes desta troca de senha.
        empresa.setTokenVersion(empresa.getTokenVersion() + 1);
        empresaRepository.save(empresa);
    }

    /**
     * Valida o CNPJ pelos dígitos verificadores (módulo 11). O @Pattern do DTO só
     * garante que são 14 números; aqui checamos se é um CNPJ realmente válido,
     * recusando casos como "00000000000000".
     * @param cnpj CNPJ com 14 dígitos (somente números)
     * @return true se os dois dígitos verificadores conferirem
     */
    private boolean cnpjValido(String cnpj) {
        if (cnpj == null || cnpj.length() != 14 || !cnpj.matches("\\d{14}")) {
            return false;
        }
        // CNPJ com todos os dígitos iguais passa na conta, mas é inválido.
        if (cnpj.chars().distinct().count() == 1) {
            return false;
        }

        int[] pesos1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] pesos2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        int dv1 = calcularDigito(cnpj.substring(0, 12), pesos1);
        int dv2 = calcularDigito(cnpj.substring(0, 12) + dv1, pesos2);

        return cnpj.charAt(12) - '0' == dv1 && cnpj.charAt(13) - '0' == dv2;
    }

    // Calcula um dígito verificador pelo módulo 11 a partir dos pesos informados.
    private int calcularDigito(String base, int[] pesos) {
        int soma = 0;
        for (int i = 0; i < base.length(); i++) {
            soma += (base.charAt(i) - '0') * pesos[i];
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
