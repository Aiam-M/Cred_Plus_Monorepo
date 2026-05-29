# ============================================================
# Dockerfile do backend Java (Spring Boot) - Cred+
#
# Usa duas etapas (multi-stage build):
#   1. "build"   -> compila o projeto e gera o .jar (precisa do Maven + JDK)
#   2. "runtime" -> imagem final, leve, só com Java para rodar o .jar
#
# Por que duas etapas: a imagem final NÃO carrega o Maven nem o código-fonte,
# só o .jar pronto. Isso deixa a imagem menor e mais segura.
# ============================================================

# ---------- Etapa 1: build (compilação) ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copia o projeto e gera o .jar (pulando os testes para o build ser mais rápido)
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# ---------- Etapa 2: runtime (execução) ----------
# Imagem só com o Java de runtime (JRE), bem menor que o JDK completo.
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copia apenas o .jar gerado na etapa de build
COPY --from=build /app/target/*.jar app.jar

# Porta padrão do Spring Boot (informativo; o Render injeta a porta via $PORT)
EXPOSE 8080

# Sobe a aplicação. Usamos ${PORT:-8080} porque o Render define a variável PORT
# automaticamente; localmente, se PORT não existir, cai no 8080 padrão.
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
