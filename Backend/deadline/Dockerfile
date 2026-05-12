# Estágio 1: Build (Compilação)
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copia o arquivo de dependências e baixa (faz cache)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código fonte e compila ignorando os testes (o CI do GitHub já fez os testes)
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio 2: Produção (Execução)

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Pega o arquivo .jar gerado no Estágio 1
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta padrão do Spring
EXPOSE 8080

# Inicia a aplicação injetando as variáveis de ambiente
ENTRYPOINT ["java", "-jar", "app.jar"]