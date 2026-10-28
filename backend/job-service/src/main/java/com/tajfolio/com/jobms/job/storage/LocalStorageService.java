package com.tajfolio.com.jobms.job.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

/**
 * Local Filesystem implementation of StorageService with presigned URL simulation.
 */
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    @Value("${resume.upload.dir:./uploads/resumes}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                log.info("Initialized local object storage directory: {}", path.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("Could not create local storage directory: {}", e.getMessage());
        }
    }

    @Override
    public String storeFile(MultipartFile file, String prefix) throws IOException {
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        String cleanName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storageKey = UUID.randomUUID() + "_" + cleanName;

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path targetPath = uploadPath.resolve(storageKey);
        Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        log.info("Stored file locally with key [{}] ({} bytes)", storageKey, file.getSize());
        return storageKey;
    }

    @Override
    public byte[] loadFile(String storageKey) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(storageKey);
        File file = filePath.toFile();
        if (!file.exists()) {
            throw new IOException("File not found in storage: " + storageKey);
        }
        return Files.readAllBytes(filePath);
    }

    @Override
    public boolean deleteFile(String storageKey) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(storageKey);
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete stored file [{}]: {}", storageKey, e.getMessage());
            return false;
        }
    }

    @Override
    public String generatePresignedUrl(String storageKey, int expirationMinutes) {
        // Direct route via Gateway or service
        long expiresAt = System.currentTimeMillis() + (expirationMinutes * 60L * 1000L);
        return "/resumes/" + storageKey + "?expires=" + expiresAt;
    }
}
