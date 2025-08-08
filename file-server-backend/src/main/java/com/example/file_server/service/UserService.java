package com.example.file_server.service;

import com.example.file_server.model.AuthRequest;
import com.example.file_server.model.AuthResponse;
import com.example.file_server.model.User;
import com.example.file_server.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + id));
    }

    public User updateUser(String id, User updatedUser) {
        Optional<User> existingUserOptional = userRepository.findById(id);
        if (existingUserOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + id);
        }

        User existingUser = existingUserOptional.get();
        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        return userRepository.save(existingUser);
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }

    public AuthResponse authenticate(AuthRequest authRequest) {
        Optional<User> userOptional = userRepository.findAll().stream()
                .filter(user -> user.getEmail().equals(authRequest.getEmail()) && user.getPassword().equals(authRequest.getPassword()))
                .findFirst();

        if (userOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        User user = userOptional.get();
        return new AuthResponse(user.getId(), "Authentication successful");
    }
}
