-- ============================================================================
-- JOBFLOW ATS ENTERPRISE MICROSERVICES — DATABASE SCHEMA ISOLATION BLUEPRINT
-- PostgreSQL 14+ Logical Schema Isolation Architecture
-- ============================================================================
-- Each bounded context microservice owns its own isolated logical schema
-- with dedicated tables, indexes, and restricted service user roles.
-- ============================================================================

-- 1. AUTH SERVICE SCHEMA
CREATE SCHEMA IF NOT EXISTS auth_schema;

CREATE TABLE IF NOT EXISTS auth_schema.users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CANDIDATE',
    phone VARCHAR(50),
    title VARCHAR(255),
    company_id BIGINT,
    company_name VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_schema.revoked_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_jti VARCHAR(255) UNIQUE NOT NULL,
    revoked_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- 2. JOB & APPLICATION CORE SERVICE SCHEMA
CREATE SCHEMA IF NOT EXISTS job_schema;

CREATE TABLE IF NOT EXISTS job_schema.job (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    min_salary VARCHAR(100),
    max_salary VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    company_id BIGINT NOT NULL,
    recruiter_id BIGINT,
    job_type VARCHAR(50) DEFAULT 'Full-time',
    experience_level VARCHAR(50) DEFAULT 'Mid-Level',
    required_skills TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    published_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_schema.application (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL,
    candidate_id BIGINT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    resume_url VARCHAR(1000) NOT NULL,
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    interview_date TIMESTAMP WITHOUT TIME ZONE,
    interview_time VARCHAR(50),
    interview_location VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candidate_job UNIQUE (email, job_id)
);

CREATE TABLE IF NOT EXISTS job_schema.interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    recruiter_id BIGINT,
    scheduled_start TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITHOUT TIME ZONE,
    type VARCHAR(50) DEFAULT 'TECHNICAL',
    meeting_link VARCHAR(500),
    interviewer_notes TEXT,
    feedback_score INTEGER,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_schema.resumes (
    id BIGSERIAL PRIMARY KEY,
    candidate_email VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    file_size BIGINT,
    parsed_skills TEXT,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_schema.audit_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    actor_email VARCHAR(255),
    actor_role VARCHAR(50),
    details TEXT,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_schema.outbox_events (
    id BIGSERIAL PRIMARY KEY,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITHOUT TIME ZONE
);

-- 3. COMPANY SERVICE SCHEMA
CREATE SCHEMA IF NOT EXISTS company_schema;

CREATE TABLE IF NOT EXISTS company_schema.company (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(500),
    industry VARCHAR(100),
    size VARCHAR(50),
    location VARCHAR(255),
    rating NUMERIC(3, 2) DEFAULT 4.5,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. REVIEW SERVICE SCHEMA
CREATE SCHEMA IF NOT EXISTS review_schema;

CREATE TABLE IF NOT EXISTS review_schema.review (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rating DOUBLE PRECISION NOT NULL,
    company_id BIGINT NOT NULL,
    user_id BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. NOTIFICATION SERVICE SCHEMA
CREATE SCHEMA IF NOT EXISTS notification_schema;

CREATE TABLE IF NOT EXISTS notification_schema.notification_logs (
    id BIGSERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    channel VARCHAR(50) DEFAULT 'EMAIL',
    type VARCHAR(100) NOT NULL,
    subject VARCHAR(500),
    message TEXT,
    status VARCHAR(50) DEFAULT 'DELIVERED',
    read BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    sent_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. RECOMMENDATION SERVICE SCHEMA
CREATE SCHEMA IF NOT EXISTS recommendation_schema;

CREATE TABLE IF NOT EXISTS recommendation_schema.candidate_profiles (
    id BIGSERIAL PRIMARY KEY,
    candidate_email VARCHAR(255) UNIQUE NOT NULL,
    skills TEXT,
    preferred_locations TEXT,
    preferred_job_types TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Schema Isolation Permissions & Search Paths:
-- Each microservice Spring DataSource URL specifies its currentSchema:
-- e.g. jdbc:postgresql://postgres:5432/jobapp?currentSchema=job_schema
-- ============================================================================
