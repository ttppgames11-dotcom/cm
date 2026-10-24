# Connect Maratha API, Spring Boot version. Build context = this folder (backend-java/).
#   docker build -t connect-maratha-api-java .
# Tests are not run here: they start the Node server too and are run on your computer (mvn test).

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src src
RUN mvn -q -B -DskipTests package \
 && cp target/api-*.jar app.jar

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /build/app.jar app.jar
USER app
EXPOSE 5001
# Stay inside the container's memory cap (the compose file sets 640m).
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-jar", "app.jar"]
