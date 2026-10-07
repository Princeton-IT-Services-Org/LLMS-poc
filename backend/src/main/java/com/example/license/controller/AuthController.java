package com.example.license.controller;

import com.example.license.repository.UserRepository;
import com.example.license.security.JwtService;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final BCryptPasswordEncoder enc;
    private final JwtService jwt;

    public AuthController(UserRepository u, BCryptPasswordEncoder e, JwtService j) {
        users = u;
        enc = e;
        jwt = j;
    }

    public record Login(String username, String password) {
    }

    @PostMapping("/login")
    ResponseEntity<?> login(@RequestBody Login l) {
        var u = users.findByUsername(l.username()).orElse(null);
        if (u == null || !enc.matches(l.password(), u.passwordHash)) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
        return ResponseEntity.ok(Map.of(
                "token", jwt.issue(u.username, u.role.name()),
                "username", u.username,
                "role", u.role.name()));
    }

    @GetMapping("/me")
    Map<String, String> me(Authentication a) {
        return Map.of(
                "username", a.getName(),
                "role", a.getAuthorities().iterator().next().getAuthority().replace("ROLE_", ""));
    }
}
