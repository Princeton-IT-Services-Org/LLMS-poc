package com.example.license.config;

import com.example.license.model.*;
import com.example.license.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class SeedData {
    @Bean
    CommandLineRunner seed(UserRepository r, BCryptPasswordEncoder e) {
        return a -> {
            if (r.count() == 0) {
                String p = e.encode("Password@123");
                r.save(new AppUser("reader", p, Role.READ_ACCESS));
                r.save(new AppUser("config", p, Role.CONFIGURATION_MANAGER));
                r.save(new AppUser("controller", p, Role.LICENSE_CONTROLLER));
                r.save(new AppUser("admin", p, Role.SUPER_ADMIN));
            }
        };
    }
}