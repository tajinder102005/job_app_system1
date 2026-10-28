FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/configserver-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8888
CMD ["java", "-jar", "app.jar"]
