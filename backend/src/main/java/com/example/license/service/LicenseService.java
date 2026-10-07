package com.example.license.service;

import com.example.license.model.*;
import com.example.license.repository.LicenseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.*;
import java.security.spec.*;
import java.time.LocalDate;
import java.util.*;

@Service
public class LicenseService {

    private final LicenseRepository repo;
    private final ObjectMapper json;

    @Value("${app.storage-path}")
    String storage;

    @Value("${app.key-path}")
    String keys;

    public LicenseService(LicenseRepository r, ObjectMapper j) {
        repo = r;
        json = j;
    }

    public LicenseRecord create(LicenseRecord x, String user) throws Exception {
        x.id = null;
        x.requestId = "REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        x.createdDate = LocalDate.now();
        x.status = LicenseStatus.ACTIVE;
        x.createdBy = user;
        if (x.expiryDate == null) {
            x.expiryDate = LocalDate.now().plusDays(30);
        }
        String payload = json.writeValueAsString(Map.of(
                "requestId", x.requestId,
                "customer", x.customer,
                "product", x.product,
                "version", x.version,
                "environment", x.environment,
                "type", x.licenseType,
                "features", x.features == null ? "" : x.features,
                "createdDate", x.createdDate.toString(),
                "expiryDate", x.expiryDate.toString(),
                "status", x.status.name()));
        x.signature = sign(payload);
        Path dir = Path.of(storage, safe(x.customer), safe(x.environment));
        Files.createDirectories(dir);
        Path lic = dir.resolve(x.requestId + ".lic");
        Files.writeString(lic, payload + "\nsignature=" + x.signature, StandardCharsets.UTF_8);
        Files.writeString(
                dir.resolve(x.requestId + "-metadata.json"),
                json.writerWithDefaultPrettyPrinter().writeValueAsString(x));
        x.filePath = lic.toString();
        return repo.save(x);
    }

    private String safe(String v) {
        return v.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String sign(String data) throws Exception {
        KeyPair kp = pair();
        Signature s = Signature.getInstance("SHA256withRSA");
        s.initSign(kp.getPrivate());
        s.update(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(s.sign());
    }

    private KeyPair pair() throws Exception {
        Path d = Path.of(keys);
        Files.createDirectories(d);
        Path pri = d.resolve("private.key"), pub = d.resolve("public.key");
        KeyFactory kf = KeyFactory.getInstance("RSA");
        if (Files.exists(pri) && Files.exists(pub)) {
            return new KeyPair(
                    kf.generatePublic(new X509EncodedKeySpec(Base64.getDecoder().decode(Files.readString(pub)))),
                    kf.generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(Files.readString(pri)))));
        }
        KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
        g.initialize(2048);
        KeyPair kp = g.generateKeyPair();
        Files.writeString(pri, Base64.getEncoder().encodeToString(kp.getPrivate().getEncoded()));
        Files.writeString(pub, Base64.getEncoder().encodeToString(kp.getPublic().getEncoded()));
        return kp;
    }

    public LicenseRecord state(long id, LicenseStatus s) {
        var x = repo.findById(id).orElseThrow();
        x.status = s;
        if (s == LicenseStatus.RENEWED) {
            x.expiryDate = x.expiryDate.plusYears(1);
            x.status = LicenseStatus.ACTIVE;
        }
        return repo.save(x);
    }
}
