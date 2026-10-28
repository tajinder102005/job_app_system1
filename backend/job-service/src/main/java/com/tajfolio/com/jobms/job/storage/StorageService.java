package com.tajfolio.com.jobms.job.storage;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

/**
 * Enterprise Object Storage abstraction for candidate resumes, attachments, and documents.
 * Supports Local Filesystem storage and S3 / MinIO object storage.
 */
public interface StorageService {

    /**
     * Store an uploaded file into object storage.
     * @param file The multipart file to store
     * @param prefix Path or folder prefix (e.g., "resumes/")
     * @return Storage key identifier
     * @throws IOException If storage fails
     */
    String storeFile(MultipartFile file, String prefix) throws IOException;

    /**
     * Retrieve file content by storage key.
     * @param storageKey Storage key returned during upload
     * @return Raw bytes of the file
     * @throws IOException If file cannot be read
     */
    byte[] loadFile(String storageKey) throws IOException;

    /**
     * Delete file from object storage.
     * @param storageKey Storage key to delete
     * @return true if deleted
     */
    boolean deleteFile(String storageKey);

    /**
     * Generate presigned URL or direct access URL for viewing/downloading.
     * @param storageKey Storage key
     * @param expirationMinutes Validity duration
     * @return URL string
     */
    String generatePresignedUrl(String storageKey, int expirationMinutes);
}
