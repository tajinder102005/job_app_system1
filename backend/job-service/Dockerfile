FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/jobms-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8099
CMD ["java", "-jar", "app.jar"]
