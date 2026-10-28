@echo off
title Microservices Architecture Startup

echo 🚀 Starting Microservices Architecture...

set "ROOT_DIR=%~dp0.."

REM Start RabbitMQ and Zipkin first (dependencies)
echo 🐰 Starting RabbitMQ...
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.9-management 2>nul

echo 📊 Starting Zipkin...
docker run -d --name zipkin -p 9411:9411 openzipkin/zipkin:2.23 2>nul

REM Wait for dependencies to be ready
echo ⏳ Waiting for dependencies to start...
timeout /t 15 /nobreak

REM Start Service Registry
echo 📋 Starting Service Registry (Eureka)...
cd /d "%ROOT_DIR%\backend\service-registry"
start "Service Registry" mvn spring-boot:run

REM Wait for Eureka to start
echo ⏳ Waiting for Eureka to start...
timeout /t 25 /nobreak

REM Start Config Server
echo ⚙️ Starting Config Server...
cd /d "%ROOT_DIR%\backend\config-server"
start "Config Server" mvn spring-boot:run

REM Wait for Config Server to start
echo ⏳ Waiting for Config Server to start...
timeout /t 20 /nobreak

REM Start Company Service
echo 🏢 Starting Company Service...
cd /d "%ROOT_DIR%\backend\company-service"
start "Company Service" mvn spring-boot:run

REM Wait for Company Service to start
echo ⏳ Waiting for Company Service to start...
timeout /t 20 /nobreak

REM Start Review Service
echo ⭐ Starting Review Service...
cd /d "%ROOT_DIR%\backend\review-service"
start "Review Service" mvn spring-boot:run

REM Wait for Review Service to start
echo ⏳ Waiting for Review Service to start...
timeout /t 20 /nobreak

REM Start Job Service
echo 💼 Starting Job Service...
cd /d "%ROOT_DIR%\backend\job-service"
start "Job Service" mvn spring-boot:run

REM Wait for Job Service to start
echo ⏳ Waiting for Job Service to start...
timeout /t 20 /nobreak

REM Start API Gateway
echo 🚪 Starting API Gateway...
cd /d "%ROOT_DIR%\backend\api-gateway"
start "API Gateway" mvn spring-boot:run

echo ✅ All services started successfully!
echo.
echo 🌐 Service URLs:
echo 📋 Service Registry: http://localhost:8761
echo ⚙️ Config Server: http://localhost:8888
echo 🏢 Company Service: http://localhost:8082
echo ⭐ Review Service: http://localhost:8086
echo 💼 Job Service: http://localhost:8099
echo 🚪 API Gateway: http://localhost:8100
echo 🐰 RabbitMQ Management: http://localhost:15672
echo 📊 Zipkin: http://localhost:9411
echo.
echo 🧪 Test API Gateway endpoints:
echo GET http://localhost:8100/companies
echo GET http://localhost:8100/jobs
echo GET http://localhost:8100/reviews
echo.
echo Press any key to stop all services...
pause

REM Cleanup
echo 🛑 Stopping all services...
taskkill /f /im java.exe 2>nul
docker stop rabbitmq zipkin 2>nul
docker rm rabbitmq zipkin 2>nul
echo ✅ Cleanup completed!
pause
