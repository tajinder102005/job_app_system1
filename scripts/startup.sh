#!/bin/bash

echo "🚀 Starting Microservices Architecture..."

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Start RabbitMQ and Zipkin first (dependencies)
echo "🐰 Starting RabbitMQ..."
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.9-management 2>/dev/null

echo "📊 Starting Zipkin..."
docker run -d --name zipkin -p 9411:9411 openzipkin/zipkin:2.23 2>/dev/null

# Wait for dependencies to be ready
echo "⏳ Waiting for dependencies to start..."
sleep 15

# Start Service Registry
echo "📋 Starting Service Registry (Eureka)..."
cd "$ROOT_DIR/backend/service-registry" || exit
mvn spring-boot:run &
SERVICE_REGISTRY_PID=$!

# Wait for Eureka to start
echo "⏳ Waiting for Eureka to start..."
sleep 25

# Start Config Server
echo "⚙️ Starting Config Server..."
cd "$ROOT_DIR/backend/config-server" || exit
mvn spring-boot:run &
CONFIG_SERVER_PID=$!

# Wait for Config Server to start
echo "⏳ Waiting for Config Server to start..."
sleep 20

# Start Company Service
echo "🏢 Starting Company Service..."
cd "$ROOT_DIR/backend/company-service" || exit
mvn spring-boot:run &
COMPANY_SERVICE_PID=$!

# Wait for Company Service to start
echo "⏳ Waiting for Company Service to start..."
sleep 20

# Start Review Service
echo "⭐ Starting Review Service..."
cd "$ROOT_DIR/backend/review-service" || exit
mvn spring-boot:run &
REVIEW_SERVICE_PID=$!

# Wait for Review Service to start
echo "⏳ Waiting for Review Service to start..."
sleep 20

# Start Job Service
echo "💼 Starting Job Service..."
cd "$ROOT_DIR/backend/job-service" || exit
mvn spring-boot:run &
JOB_SERVICE_PID=$!

# Wait for Job Service to start
echo "⏳ Waiting for Job Service to start..."
sleep 20

# Start API Gateway
echo "🚪 Starting API Gateway..."
cd "$ROOT_DIR/backend/api-gateway" || exit
mvn spring-boot:run &
GATEWAY_PID=$!

echo "✅ All services started successfully!"
echo ""
echo "🌐 Service URLs:"
echo "📋 Service Registry: http://localhost:8761"
echo "⚙️ Config Server: http://localhost:8888"
echo "🏢 Company Service: http://localhost:8082"
echo "⭐ Review Service: http://localhost:8086"
echo "💼 Job Service: http://localhost:8099"
echo "🚪 API Gateway: http://localhost:8100"
echo "🐰 RabbitMQ Management: http://localhost:15672"
echo "📊 Zipkin: http://localhost:9411"
echo ""
echo "🧪 Test API Gateway endpoints:"
echo "GET http://localhost:8100/companies"
echo "GET http://localhost:8100/jobs"
echo "GET http://localhost:8100/reviews"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping all services..."
    kill $SERVICE_REGISTRY_PID $CONFIG_SERVER_PID $COMPANY_SERVICE_PID $REVIEW_SERVICE_PID $JOB_SERVICE_PID $GATEWAY_PID 2>/dev/null
    docker stop rabbitmq zipkin 2>/dev/null
    docker rm rabbitmq zipkin 2>/dev/null
    echo "✅ Cleanup completed!"
}

# Trap SIGINT and SIGTERM
trap cleanup EXIT

# Wait for user input to stop
echo "Press Ctrl+C to stop all services..."
wait
