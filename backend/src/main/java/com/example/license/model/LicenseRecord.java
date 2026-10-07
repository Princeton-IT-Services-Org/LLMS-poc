package com.example.license.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "licenses")
public class LicenseRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(unique = true)
    public String requestId;

    public String customer;
    public String product;
    public String version;
    public String environment;
    public String licenseType;

    @Enumerated(EnumType.STRING)
    public LicenseStatus status;

    public LocalDate createdDate;
    public LocalDate expiryDate;
    public String features;
    public String createdBy;
    public String filePath;
    public String signature;
}
