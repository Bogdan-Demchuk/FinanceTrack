package com.example.demo.controller;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.model.User;
import com.example.demo.security.SecurityUtils;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * Login and logout are handled directly by Spring Security (see SecurityConfig):
 *   POST /api/auth/login   (form fields: email, password)
 *   POST /api/auth/logout
 * This controller only covers what Spring Security doesn't: registration and "who am I".
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        return UserResponse.from(user);
    }

    @GetMapping("/me")
    public UserResponse me() {
        User user = userService.getById(SecurityUtils.getCurrentUserId());
        return UserResponse.from(user);
    }
}
