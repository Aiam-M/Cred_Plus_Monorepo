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
        empresaRepository.save(empresa);
    }
}
