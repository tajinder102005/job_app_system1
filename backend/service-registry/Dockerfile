FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/service-reg-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8761
CMD ["java", "-jar", "app.jar"]
