# ── Stage 1 : build Maven ────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /workspace

# Copier les POMs pour cache des dépendances
COPY pom.xml .
COPY services/zma-gateway/pom.xml     services/zma-gateway/pom.xml
COPY services/zma-auth/pom.xml        services/zma-auth/pom.xml
COPY services/zma-users/pom.xml       services/zma-users/pom.xml
COPY services/zma-catalog/pom.xml     services/zma-catalog/pom.xml
COPY services/zma-media/pom.xml       services/zma-media/pom.xml
COPY services/zma-enrollment/pom.xml  services/zma-enrollment/pom.xml
COPY services/zma-payment/pom.xml     services/zma-payment/pom.xml
COPY services/zma-community/pom.xml   services/zma-community/pom.xml

# Télécharger les dépendances (couche cachée)
RUN mvn dependency:go-offline -q 2>/dev/null || true

# Copier les sources
COPY services/ services/

# Compiler le service demandé
ARG SERVICE_NAME
RUN mvn -pl services/${SERVICE_NAME} -am package -DskipTests -q

# ── Stage 2 : runtime minimal ────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
ARG SERVICE_NAME

COPY --from=build /workspace/services/${SERVICE_NAME}/target/*.jar app.jar

# Optimisations JVM pour conteneurs
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
