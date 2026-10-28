package com.tajfolio.com.jobms.job.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.UUID;

/**
 * Production-grade Cloud Object Storage service using Supabase Storage API.
 * Uploads candidate resumes directly to Supabase Storage and returns global CDN URLs.
 */
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "supabase")
@Primary
public class SupabaseStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.key:}")
    private String supabaseKey;

    @Value("${supabase.bucket:resumes}")
    private String bucket;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void init() {
        log.info("Initialized Supabase Cloud Object Storage for bucket [{}] at [{}]", bucket, supabaseUrl);
    }

    @Override
    public String storeFile(MultipartFile file, String prefix) throws IOException {
        if (supabaseUrl == null || supabaseUrl.isBlank() || supabaseKey == null || supabaseKey.isBlank()) {
            throw new IOException("Supabase storage is enabled but SUPABASE_URL or SUPABASE_KEY is missing.");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
        String cleanName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storageKey = UUID.randomUUID() + "_" + cleanName;

        String uploadUrl = String.format("%s/storage/v1/object/%s/%s", cleanUrl(supabaseUrl), bucket, storageKey);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("apikey", supabaseKey);
        headers.setContentType(MediaType.parseMediaType(
            file.getContentType() != null ? file.getContentType() : "application/pdf"
        ));

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Uploaded resume to Supabase Storage bucket [{}] with key [{}]", bucket, storageKey);
                return storageKey;
            } else {
                throw new IOException("Supabase Storage responded with: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Failed to upload file to Supabase Storage: {}", e.getMessage());
            throw new IOException("Supabase upload failed: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] loadFile(String storageKey) throws IOException {
        String downloadUrl = String.format("%s/storage/v1/object/%s/%s", cleanUrl(supabaseUrl), bucket, storageKey);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("apikey", supabaseKey);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(downloadUrl, HttpMethod.GET, requestEntity, byte[].class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            throw new IOException("Failed to load file from Supabase: HTTP " + response.getStatusCode());
        } catch (Exception e) {
            throw new IOException("Supabase fetch failed: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean deleteFile(String storageKey) {
        String deleteUrl = String.format("%s/storage/v1/object/%s/%s", cleanUrl(supabaseUrl), bucket, storageKey);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("apikey", supabaseKey);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(deleteUrl, HttpMethod.DELETE, requestEntity, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("Failed to delete file from Supabase Storage [{}]: {}", storageKey, e.getMessage());
            return false;
        }
    }

    @Override
    public String generatePresignedUrl(String storageKey, int expirationMinutes) {
        // Return public CDN URL for public bucket
        return String.format("%s/storage/v1/object/public/%s/%s", cleanUrl(supabaseUrl), bucket, storageKey);
    }

    private String cleanUrl(String url) {
        if (url == null) return "";
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
