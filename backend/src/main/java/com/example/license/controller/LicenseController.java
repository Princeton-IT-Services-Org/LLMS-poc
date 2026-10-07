package com.example.license.controller;

import com.example.license.model.*;
import com.example.license.repository.LicenseRepository;
import com.example.license.service.LicenseService;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class LicenseController {

    private final LicenseRepository repo;
    private final LicenseService service;

    public LicenseController(LicenseRepository r, LicenseService s) {
        repo = r;
        service = s;
    }

    @GetMapping("/licenses")
    List<LicenseRecord> all() {
        return repo.findAll();
    }

    @GetMapping("/licenses/{id}")
    LicenseRecord one(@PathVariable long id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping("/licenses")
    @PreAuthorize("hasAnyRole('LICENSE_CONTROLLER','SUPER_ADMIN')")
    LicenseRecord create(@RequestBody LicenseRecord x, Authentication a) throws Exception {
        return service.create(x, a.getName());
    }

    @PostMapping("/licenses/{id}/renew")
    @PreAuthorize("hasAnyRole('LICENSE_CONTROLLER','SUPER_ADMIN')")
    LicenseRecord renew(@PathVariable long id) {
        return service.state(id, LicenseStatus.RENEWED);
    }

    @PostMapping("/licenses/{id}/suspend")
    @PreAuthorize("hasAnyRole('LICENSE_CONTROLLER','SUPER_ADMIN')")
    LicenseRecord suspend(@PathVariable long id) {
        return service.state(id, LicenseStatus.SUSPENDED);
    }

    @PostMapping("/licenses/{id}/revoke")
    @PreAuthorize("hasAnyRole('LICENSE_CONTROLLER','SUPER_ADMIN')")
    LicenseRecord revoke(@PathVariable long id) {
        return service.state(id, LicenseStatus.REVOKED);
    }

    @GetMapping("/licenses/{id}/download")
    ResponseEntity<Resource> download(@PathVariable long id) throws Exception {
        var x = repo.findById(id).orElseThrow();
        var resource = new FileSystemResource(Path.of(x.filePath));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @GetMapping("/dashboard")
    Map<String, Long> dash() {
        long exp = repo.findAll().stream()
                .filter(x -> x.expiryDate != null
                        && x.expiryDate.isAfter(LocalDate.now())
                        && x.expiryDate.isBefore(LocalDate.now().plusDays(31)))
                .count();
        long expired = repo.findAll().stream()
                .filter(x -> x.expiryDate != null && x.expiryDate.isBefore(LocalDate.now()))
                .count();
        return Map.of(
                "total", repo.count(),
                "active", repo.countByStatus(LicenseStatus.ACTIVE),
                "expiringSoon", exp,
                "suspended", repo.countByStatus(LicenseStatus.SUSPENDED),
                "revoked", repo.countByStatus(LicenseStatus.REVOKED),
                "expired", expired);
    }
}
