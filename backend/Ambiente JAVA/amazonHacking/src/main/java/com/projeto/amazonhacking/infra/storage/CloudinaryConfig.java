package com.projeto.amazonhacking.infra.storage;

import java.net.URI;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

/**
 * Cria o cliente do Cloudinary. Aceita duas formas de configuração:
 *
 *  A) Três variáveis separadas (RECOMENDADA, mais robusta):
 *       CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *     Montamos a config direto, sem passar por parsing de URL.
 *
 *  B) Uma URL única: CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
 *     Atenção: o parser interno usa java.net.URI, que devolve api_key/cloud_name
 *     NULOS (sem erro) se houver um caractere inválido na autoridade — por exemplo
 *     um '_' no nome do cloud. Por isso a opção A é mais segura.
 *
 * Se nada estiver configurado, criamos um cliente "vazio": o resto do sistema
 * continua funcionando e só o upload de imagem recusa com mensagem clara.
 */
@Configuration
public class CloudinaryConfig {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryConfig.class);

    @Bean
    public Cloudinary cloudinary(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret,
            @Value("${cloudinary.url:}") String cloudinaryUrl) {

        // Opção A: variáveis separadas (sem parsing de URL).
        if (!cloudName.isBlank() && !apiKey.isBlank() && !apiSecret.isBlank()) {
            log.info("Cloudinary configurado via variáveis separadas (cloud: {}).", cloudName);
            return new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true));
        }

        // Opção B: CLOUDINARY_URL.
        if (cloudinaryUrl == null || cloudinaryUrl.isBlank()) {
            log.warn("Cloudinary não configurado. O upload de imagens ficará desativado.");
            return new Cloudinary(ObjectUtils.emptyMap());
        }

        Cloudinary cloudinary = new Cloudinary(cloudinaryUrl);
        Object key = cloudinary.config.apiKey;

        if (key == null || key.toString().isBlank()) {
            diagnosticarUrlInvalida(cloudinaryUrl);
        } else {
            log.info("Cloudinary configurado via CLOUDINARY_URL (cloud: {}).", cloudinary.config.cloudName);
        }
        return cloudinary;
    }

    /**
     * Loga, de forma SEGURA (sem o segredo), por que a CLOUDINARY_URL não parseou.
     * O host (cloud_name) não é segredo; o userInfo (api_key:api_secret) só é
     * reportado como presente/ausente.
     */
    private void diagnosticarUrlInvalida(String url) {
        try {
            URI uri = URI.create(url);
            log.warn("CLOUDINARY_URL inválida: scheme={}, cloud_name(host)={}, credenciais ausentes={}. "
                            + "Causa provável: caractere que o parser de URI do Java rejeita (ex.: '_' no nome do cloud). "
                            + "Solução recomendada: usar CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.",
                    uri.getScheme(), uri.getHost(), uri.getUserInfo() == null);
        } catch (Exception e) {
            log.warn("CLOUDINARY_URL não pôde ser interpretada como URI. "
                    + "Use CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.");
        }
    }
}
