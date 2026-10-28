FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/gatway-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8100
CMD ["java", "-jar", "app.jar"]
