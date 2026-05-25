package com.projeto.amazonhacking.models;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity(name = "users")
@Table(name = "users")
public class Usuario implements UserDetails{

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "associacao_id")
    private int associacaoId;

    // Navegação somente-leitura para a associação. Compartilha a coluna associacao_id
    // (insertable/updatable = false) para não interferir no cadastro existente,
    // que continua gravando apenas o id inteiro.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "associacao_id", insertable = false, updatable = false)
    private Associacao associacao;

    private String nome;
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private UsuarioRole role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Usuario(String nome, String email, String passwordHash, int associacaoId, UsuarioRole role){
        this.nome = nome;
        this.email = email;
        this.passwordHash = passwordHash;
        this.associacaoId = associacaoId;
        this.role = role;
    }

    @PrePersist
    public void prePersist(){
        createdAt = LocalDateTime.now();
    }

    public Usuario(){}

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public int getAssociacaoId() {
        return associacaoId;
    }

    public void setAssociacaoId(int associacaoId) {
        this.associacaoId = associacaoId;
    }

    public Associacao getAssociacao() {
        return associacao;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordBash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UsuarioRole getRole() {
        return role;
    }

    public void setRole(UsuarioRole role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if(this.role == UsuarioRole.ADMIN) return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_USER"));
        else return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return this.passwordHash;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isEnabled(){
        return true;
    }
    @Override
    public boolean isAccountNonExpired(){
        return true;
    }
    @Override
    public boolean isAccountNonLocked(){
        return true;
    }
    @Override
    public boolean isCredentialsNonExpired(){
        return true;
    }

    
}
