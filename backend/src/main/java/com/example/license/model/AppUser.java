package com.example.license.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(unique = true, nullable = false)
    public String username;

    public String passwordHash;

    @Enumerated(EnumType.STRING)
    public Role role;

    public AppUser() {
    }

    public AppUser(String u, String p, Role r) {
        username = u;
        passwordHash = p;
        role = r;
    }
}
