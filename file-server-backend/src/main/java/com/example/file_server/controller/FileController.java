package com.example.file_server.controller;

import com.example.file_server.model.FileMetadata;
import com.example.file_server.service.FileServerService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FileController {
    private final FileServerService fileServerService;

    public FileController(FileServerService fileServerService) {
        this.fileServerService = fileServerService;
    }

    @PostMapping("/upload")
    public ResponseEntity<FileMetadata> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("userId") String userId) {
        FileMetadata fileMetadata = fileServerService.uploadFile(file, userId);
        return ResponseEntity.ok(fileMetadata);
    }

    @GetMapping("/files")
    public ResponseEntity<List<FileMetadata>> getAllFiles(@RequestParam("userId") String userId) {
        return ResponseEntity.ok(fileServerService.getAllFiles(userId));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id, @RequestParam("userId") String userId) {
        Resource resource = fileServerService.downloadFile(id, userId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<byte[]> viewFileContent(@PathVariable String id, @RequestParam("userId") String userId) {
        FileMetadata fileMetadata = fileServerService.getFileMetadata(id, userId); // You must implement this
        byte[] content = fileServerService.viewFileContent(id, userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(fileMetadata.getFileType())); // e.g., "application/pdf"
        headers.setContentDisposition(ContentDisposition.inline().filename(fileMetadata.getOriginalFileName()).build());

        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFile(@PathVariable String id, @RequestParam("userId") String userId) {
        fileServerService.deleteFile(id, userId);
        return ResponseEntity.ok("File Deleted");
    }
}