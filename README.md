# Job Application System - Microservices Architecture

## 🏗️ Architecture Overview

This project demonstrates a complete **Microservices Architecture** built with Spring Boot, implementing all major microservices patterns and tools.

## 🎯 Implemented Concepts & Tools

### ✅ Core Microservices Patterns
- **Service Decomposition** - Monolith to Microservices
- **Service Registry** - Eureka Server & Client
- **API Gateway** - Spring Cloud Gateway
- **Centralized Configuration** - Spring Cloud Config Server
- **Inter-Service Communication** - OpenFeign & RestTemplate
- **Service Discovery** - Eureka Discovery Client

### ✅ Resilience & Fault Tolerance
- **Circuit Breaker** - Resilience4J
- **Retry Mechanism** - Resilience4J Retry
- **Rate Limiting** - Resilience4J Rate Limiter
- **Fallback Methods** - Circuit Breaker Fallbacks

### ✅ Distributed Tracing
- **Zipkin** - Distributed Tracing Server
- **Micrometer Tracing** - Modern Trace ID Generation (Sleuth is deprecated)
- **Correlation IDs** - Request Tracking

### ✅ Message Queues & Event-Driven Architecture
- **RabbitMQ** - Message Broker
- **Asynchronous Communication** - Event Publishing
- **Event-Driven Architecture** - Company Events

### ✅ Containerization & Orchestration
- **Docker** - Container Images
- **Docker Compose** - Multi-Container Orchestration
- **Multi-Stage Builds** - Optimized Docker Images

### ✅ Monitoring & Management
- **Spring Boot Actuator** - Health Checks & Metrics
- **H2 Database** - In-Memory Database
- **Spring Boot Admin** - Service Monitoring

## 🏢 Project Directory Structure

```
job_application/
├── backend/                        # Microservices (Spring Boot)
│   ├── api-gateway/                # Spring Cloud Gateway (Port: 8100)
│   ├── auth-service/               # Authentication & JWT Service (Port: 8088)
│   ├── company-service/            # Company Management Service (Port: 8082)
│   ├── config-server/              # Spring Cloud Config Server (Port: 8888)
│   ├── job-service/                # Job & Application Service (Port: 8099)
│   ├── notification-service/       # Email & In-App Notification Service (Port: 8089)
│   ├── recommendation-service/     # AI/ML Job Recommendation Service (Port: 8084)
│   ├── review-service/             # Company Review & Rating Service (Port: 8086)
│   ├── search-service/             # Elasticsearch Job Search Service (Port: 8087)
│   └── service-registry/           # Netflix Eureka Registry (Port: 8761)
├── frontend/                       # React 18 + Vite + MUI Dark Mode (Port: 3000)
├── database/                       # Database Schemas & Migrations
│   ├── schema-isolation.sql        # PostgreSQL Schema & Multi-tenancy setup
│   └── configure_supabase.py       # Supabase Cloud Storage config helper
├── scripts/                        # Management & Automation Scripts
│   ├── startup.bat                 # Windows Microservices Startup
│   ├── startup.sh                  # Linux/Mac Microservices Startup
│   ├── start-frontend.bat          # Fast frontend launcher
│   └── demo-setup.bat              # Full platform demo launcher
├── legacy/                         # Monolith archive & standalone binaries
│   ├── firstjobapp/                # Original monolithic prototype
│   └── ...
├── docker-compose.yml              # Multi-container orchestration (Postgres, RabbitMQ, Redis, ES, Zipkin, etc.)
├── .env.example                    # Environment variables template
└── README.md                       # Comprehensive documentation
```

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+
- Node.js 18+
- Docker & Docker Compose
- Git

### Option 1: Docker Compose (All-in-One Full Stack)
```bash
docker-compose up -d
```
All backend microservices, PostgreSQL, RabbitMQ, Elasticsearch, Redis, and Zipkin start automatically!

### Option 2: Using Helper Scripts

**Linux/Mac:**
```bash
chmod +x scripts/startup.sh
./scripts/startup.sh
```

**Windows:**
```cmd
scripts\startup.bat
```

To run the frontend:
```cmd
scripts\start-frontend.bat
```

### Option 3: Manual Startup
1. Start RabbitMQ & Zipkin:
   ```bash
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.9-management
   docker run -d --name zipkin -p 9411:9411 openzipkin/zipkin:2.23
   ```

2. Start services in order:
   ```bash
   cd backend/service-registry && mvn spring-boot:run
   cd backend/config-server && mvn spring-boot:run
   cd backend/auth-service && mvn spring-boot:run
   cd backend/company-service && mvn spring-boot:run
   cd backend/review-service && mvn spring-boot:run
   cd backend/job-service && mvn spring-boot:run
   cd backend/api-gateway && mvn spring-boot:run
   ```

## 🌐 Service Endpoints

### API Gateway (Main Entry Point)
- **Base URL:** `http://localhost:8100`
- **Companies:** `GET http://localhost:8100/companies`
- **Jobs:** `GET http://localhost:8100/jobs`
- **Reviews:** `GET http://localhost:8100/reviews`

### Individual Services
- **Service Registry:** `http://localhost:8761`
- **Config Server:** `http://localhost:8888`
- **Company Service:** `http://localhost:8082`
- **Job Service:** `http://localhost:8099`
- **Review Service:** `http://localhost:8086`

### Management & Monitoring
- **RabbitMQ Management:** `http://localhost:15672` (guest/guest)
- **Zipkin Tracing:** `http://localhost:9411`
- **Eureka Dashboard:** `http://localhost:8761`

## 🧪 API Testing Examples

### Through API Gateway (Recommended)
```bash
# Create Company
POST http://localhost:8100/companies
Content-Type: application/json
{
  "name": "Tech Company",
  "description": "Technology Company"
}

# Create Job
POST http://localhost:8100/jobs
Content-Type: application/json
{
  "title": "Software Engineer",
  "description": "Java Developer",
  "location": "Remote",
  "minSalary": "50000",
  "maxSalary": "80000",
  "companyId": 1
}

# Create Review
POST http://localhost:8100/reviews
Content-Type: application/json
{
  "companyName": "Tech Company",
  "reviewText": "Great company!",
  "rating": 5
}
```

## 🔧 Configuration

### Service Registry (Eureka)
- **Port:** 8761
- **Role:** Service Discovery & Registration
- **Features:** Service Health Monitoring

### Config Server
- **Port:** 8888
- **Role:** Centralized Configuration
- **Backend:** Git Repository (configurable)

### Company Service
- **Port:** 8082
- **Database:** H2 (In-Memory)
- **Features:** CRUD Operations, Event Publishing

### Job Service
- **Port:** 8099
- **Database:** H2 (In-Memory)
- **Features:** Feign Client, Circuit Breaker, Service Integration

### Review Service
- **Port:** 8086
- **Database:** H2 (In-Memory)
- **Features:** CRUD Operations, Message Queue Integration

### API Gateway
- **Port:** 8100
- **Features:** Routing, Load Balancing, Circuit Breaker, Rate Limiting

## 🛡️ Resilience Patterns

### Circuit Breaker Configuration
```yaml
resilience4j:
  circuitbreaker:
    instances:
      companyBreaker:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        minimumNumberOfCalls: 5
```

### Retry Configuration
- **Max Attempts:** 3
- **Wait Duration:** 2s
- **Backoff:** Exponential

## 📊 Distributed Tracing

### Zipkin Integration
- **Sampling Probability:** 100% (1.0)
- **Export:** HTTP to Zipkin Server
- **Correlation:** Auto-generated Trace IDs via Micrometer Tracing
- **Technology:** Micrometer Tracing (Spring Cloud Sleuth is deprecated)

### Trace Flow
```
API Gateway → Job Service → Company Service
    ↓              ↓              ↓
  Zipkin ←←←←←←←←←←←←←←←←←←←←←←←
```

## 🐰 Message Queue Integration

### RabbitMQ Configuration
- **Exchange:** company.exchange
- **Queue:** company.queue
- **Routing Key:** company.routingkey

### Event Types
- **Company Created**
- **Company Updated**
- **Company Deleted**

## 🔍 Health Checks & Monitoring

### Actuator Endpoints
- **Health:** `/actuator/health`
- **Metrics:** `/actuator/metrics`
- **Info:** `/actuator/info`
- **Env:** `/actuator/env`

### Circuit Breaker Health
- **Status:** `/actuator/health/circuitbreakers`
- **Details:** Circuit Breaker States

## 🐳 Docker Configuration

### Multi-Stage Builds
- **Base Image:** openjdk:17-jdk-slim
- **Build Stage:** Maven Compilation
- **Runtime Stage:** JAR Execution

### Container Networking
- **Network:** microservices-network
- **Service Discovery:** Docker DNS + Eureka

## 🚦 Traffic Flow

```
Client Request
    ↓
API Gateway (8100)
    ↓
┌─────────────┬─────────────┬─────────────┐
│ Company     │ Job         │ Review      │
│ Service     │ Service     │ Service     │
│ (8082)      │ (8099)      │ (8086)      │
└─────────────┴─────────────┴─────────────┘
    ↓              ↓              ↓
┌─────────────────────────────────────────┐
│            Eureka Registry              │
│              (8761)                     │
└─────────────────────────────────────────┘
```

## 🔄 Inter-Service Communication

### Synchronous Communication
- **OpenFeign Clients** - Type-safe HTTP calls
- **Load Balancing** - Eureka-based discovery
- **Circuit Breaker** - Fault tolerance

### Asynchronous Communication
- **RabbitMQ Events** - Decoupled messaging
- **Event Publishing** - Company state changes
- **Message Queues** - Reliable delivery

## 📈 Performance & Scalability

### Horizontal Scaling
- **Stateless Services** - Easy scaling
- **Load Balancing** - Gateway + Eureka
- **Database Per Service** - Data isolation

### Caching Strategy
- **In-Memory Caching** - Application level
- **Distributed Caching** - Future enhancement
- **API Response Caching** - Gateway level

## 🔒 Security Considerations

### Current Security
- **Basic Security** - Spring Security (can be enhanced)
- **Service-to-Service** - Internal communication
- **API Gateway** - Single entry point

### Future Enhancements
- **JWT Authentication**
- **OAuth2 Authorization**
- **API Rate Limiting**
- **Request Validation**

## 🚀 Deployment Options

### Development
- **Local Machine** - Startup scripts
- **Docker Compose** - Container orchestration

### Production
- **Kubernetes** - Container orchestration
- **Cloud Platforms** - AWS, Azure, GCP
- **Service Mesh** - Istio, Linkerd

## 🧪 Testing Strategy

### Unit Testing
- **JUnit 5** - Test framework
- **Mockito** - Mocking framework
- **TestContainers** - Integration testing

### Integration Testing
- **Service Testing** - Individual services
- **Contract Testing** - Service interactions
- **End-to-End Testing** - Full flow testing

## 📝 Development Guidelines

### Code Standards
- **Layered Architecture** - Controller-Service-Repository
- **SOLID Principles** - Clean code practices
- **Design Patterns** - Microservices patterns

### Best Practices
- **Configuration Externalization** - Config server
- **Health Checks** - Actuator endpoints
- **Logging** - Structured logging
- **Error Handling** - Global exception handling

## 🔧 Troubleshooting

### Common Issues
1. **Service Registration** - Check Eureka connectivity
2. **Configuration Loading** - Verify Config Server
3. **Database Connection** - Check H2 console
4. **Network Issues** - Verify Docker networking

### Debug Commands
```bash
# Check service registration
curl http://localhost:8761/eureka/apps

# Check configuration
curl http://localhost:8888/company-service/dev

# Check health
curl http://localhost:8100/actuator/health
```

## 📚 Learning Resources

### Documentation
- [Spring Cloud Documentation](https://spring.io/projects/spring-cloud)
- [Microservices Patterns](https://microservices.io/patterns/)
- [Docker Documentation](https://docs.docker.com/)

### Tutorials
- Spring Boot Microservices
- Eureka Service Discovery
- Spring Cloud Gateway
- Resilience4J Circuit Breaker

---

## 🎉 Congratulations!

You now have a **complete microservices architecture** implementing:

✅ **All Major Microservices Patterns**  
✅ **Service Discovery & Configuration**  
✅ **API Gateway & Load Balancing**  
✅ **Circuit Breaker & Fault Tolerance**  
✅ **Distributed Tracing**  
✅ **Message Queues & Events**  
✅ **Containerization & Orchestration**  
✅ **Health Monitoring & Management**  

This architecture is **production-ready** and demonstrates **enterprise-level microservices implementation**! 🚀
