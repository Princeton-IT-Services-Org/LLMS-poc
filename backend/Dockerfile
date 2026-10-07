FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src src
RUN mvn -q -DskipTests package
FROM eclipse-temurin:21-jre
WORKDIR /app
# SQLite won't create missing parent directories, so make sure they exist even without volume mounts
RUN mkdir -p data license-storage keys
COPY --from=build /app/target/license-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
