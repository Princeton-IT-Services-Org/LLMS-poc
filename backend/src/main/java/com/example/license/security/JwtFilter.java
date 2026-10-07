package com.example.license.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwt;

    public JwtFilter(JwtService j) {
        jwt = j;
    }

    protected void doFilterInternal(HttpServletRequest r, HttpServletResponse s, FilterChain c)
            throws ServletException, IOException {
        String h = r.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            try {
                Claims cl = jwt.parse(h.substring(7));
                var auth = new UsernamePasswordAuthenticationToken(
                        cl.getSubject(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + cl.get("role", String.class))));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception ignored) {
            }
        }
        c.doFilter(r, s);
    }
}
