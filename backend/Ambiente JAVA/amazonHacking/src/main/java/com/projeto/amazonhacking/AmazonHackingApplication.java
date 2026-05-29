package com.projeto.amazonhacking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

// @EnableAsync: permite rodar o cálculo do AgroScore em uma thread separada,
//   para não travar o cadastro da safra enquanto o serviço Python responde.
// @EnableScheduling: liga o job periódico que recalcula safras que ficaram sem score.
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class AmazonHackingApplication {

    public static void main(String[] args) {
        SpringApplication.run(AmazonHackingApplication.class, args);
    }

}
