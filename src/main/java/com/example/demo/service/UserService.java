package com.example.demo.service;

import com.example.demo.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final List<User> users = new ArrayList<>();
    private long idCounter = 1;

    public List<User> getAll() {
        return users;
    }

    public User create(User user) {
        user.setId(idCounter++);
        users.add(user);
        return user;
    }

    public User getById(Long id) {
        return users.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}