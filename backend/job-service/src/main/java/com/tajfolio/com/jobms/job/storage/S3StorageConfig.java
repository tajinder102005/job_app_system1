package com.tajfolio.com.jobms.job.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for AWS S3 and MinIO object storage.
 */
@Configuration
@ConfigurationProperties(prefix = "storage.s3")
public class S3StorageConfig {

    private boolean enabled = false;
    private String endpoint = "http://minio:9000";
    private String bucketName = "jobflow-resumes";
    private String accessKey = "minioadmin";
    private String secretKey = "minioadmin";
    private String region = "us-east-1";

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

    public String getBucketName() { return bucketName; }
    public void setBucketName(String bucketName) { this.bucketName = bucketName; }

    public String getAccessKey() { return accessKey; }
    public void setAccessKey(String accessKey) { this.accessKey = accessKey; }

    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
}
