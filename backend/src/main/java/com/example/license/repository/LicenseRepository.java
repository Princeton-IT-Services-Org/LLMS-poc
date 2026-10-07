package com.example.license.repository;

import com.example.license.model.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LicenseRepository extends JpaRepository<LicenseRecord, Long> {

    long countByStatus(LicenseStatus status);
}
