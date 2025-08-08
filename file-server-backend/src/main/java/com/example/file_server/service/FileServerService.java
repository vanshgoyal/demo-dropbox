package com.example.file_server.service;

import com.example.file_server.model.FileMetadata;
import com.example.file_server.repository.FileMetadataRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileServerService {
    private final FileMetadataRepository fileMetadataRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;
    private Path fileStorageLocation;

    public FileServerService(FileMetadataRepository fileMetadataRepository) {
        this.fileMetadataRepository = fileMetadataRepository;
    }

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public FileMetadata uploadFile(MultipartFile file, String userId) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select a file to upload.");
        }

        String originalFileName = file.getOriginalFilename();
        String fileType = file.getContentType();
        long fileSize = file.getSize();

        String storedFileName = UUID.randomUUID() + "_" + originalFileName;
        Path targetLocation = this.fileStorageLocation.resolve(storedFileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            FileMetadata fileMetadata = new FileMetadata(originalFileName, storedFileName, fileType, fileSize, targetLocation.toString(), userId);
            return fileMetadataRepository.save(fileMetadata);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public List<FileMetadata> getAllFiles(String userId) {
        return fileMetadataRepository.findAll().stream()
                .filter(file -> file.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public Resource downloadFile(String id, String userId) {
        FileMetadata fileMetadata = validateFileOwnership(id, userId);
        Path filePath = Paths.get(fileMetadata.getFilePath()).normalize();
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found on disk: " + fileMetadata.getOriginalFileName());
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating resource URL for file: " + fileMetadata.getOriginalFileName(), ex);
        }
    }

    public byte[] viewFileContent(String id, String userId) {
        FileMetadata fileMetadata = validateFileOwnership(id, userId);
        Path filePath = Paths.get(fileMetadata.getFilePath()).normalize();

        try {
            return Files.readAllBytes(filePath);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading file content: " + fileMetadata.getOriginalFileName(), ex);
        }
    }

    public void deleteFile(String id, String userId) {
        FileMetadata fileMetadata = validateFileOwnership(id, userId);
        fileMetadataRepository.delete(fileMetadata);
    }

    public FileMetadata shareFile(String id, String userId) {
        return validateFileOwnership(id, userId);
    }

    private FileMetadata validateFileOwnership(String id, String userId) {
        Optional<FileMetadata> fileMetadataOptional = fileMetadataRepository.findById(id);

        if (fileMetadataOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found with ID: " + id);
        }

        FileMetadata fileMetadata = fileMetadataOptional.get();
        if (!fileMetadata.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this file.");
        }

        return fileMetadata;
    }

    public FileMetadata getFileMetadata(String id, String userId) {
        FileMetadata fileMetadata = validateFileOwnership(id, userId);
        return fileMetadataRepository.findById(fileMetadata.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found with ID: " + id));
    }
}