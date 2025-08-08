package com.example.file_server.model;

public class AuthResponse {
    private String userId;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(String userId, String message) {
        this.userId = userId;
        this.message = message;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}