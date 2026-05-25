package com.projeto.amazonhacking.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        Empresa empresa = new Empresa(dto.cnpj(), dto.email(), senhaCodificada, dto.segmento());
        empresaRepository.save(empresa);

        return new GetEmpresaDTO(empresa.getId(), empresa.getCnpj(), empresa.getEmail(), empresa.getSegmento());
    }
}
