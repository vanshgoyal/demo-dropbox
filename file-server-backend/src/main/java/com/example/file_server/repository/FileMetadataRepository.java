package com.example.file_server.repository;

import com.example.file_server.model.FileMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileMetadataRepository extends MongoRepository<FileMetadata, String> {
    // Spring Data MongoDB will automatically implement basic CRUD operations
}
