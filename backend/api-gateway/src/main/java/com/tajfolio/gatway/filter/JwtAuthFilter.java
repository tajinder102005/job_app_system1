package com.tajfolio.gatway.filter;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key;
import java.util.*;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String secret;

    private static final List<String> PUBLIC_PATHS = List.of(
        "/auth/login",
        "/auth/register",
        "/auth/validate"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path   = request.getRequestURI();
        String method = request.getMethod();
        return "OPTIONS".equalsIgnoreCase(method) ||
               PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                "Missing or invalid Authorization header");
            return;
        }

        String token = authHeader.substring(7);

        try {
            Key key = Keys.hmacShaKeyFor(secret.getBytes());
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

            String userEmail = claims.getSubject();
            String userRole  = (String) claims.get("role");
            String userId    = String.valueOf(claims.get("userId"));
            Object compId    = claims.get("companyId");
            String companyId = compId != null ? String.valueOf(compId) : "";

            String requestPath   = request.getRequestURI();
            String requestMethod = request.getMethod();

            if (!isAuthorized(requestPath, requestMethod, userRole)) {
                sendError(response, HttpServletResponse.SC_FORBIDDEN,
                    "Access denied. Insufficient permissions for role: " + userRole);
                return;
            }

            // Inject user info as headers for downstream services
            HttpServletRequest mutated = withHeaders(request, userEmail, userRole, userId, companyId);
            filterChain.doFilter(mutated, response);

        } catch (ExpiredJwtException e) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Token has expired");
        } catch (JwtException e) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
        }
    }

    private boolean isAuthorized(String path, String method, String role) {
        if ("ADMIN".equals(role)) return true;

        // Admin endpoints strictly ADMIN
        if (path.startsWith("/admin")) {
            return "ADMIN".equals(role);
        }

        // Applications routing rules
        if (path.startsWith("/applications")) {
            if ("POST".equals(method)) {
                return "CANDIDATE".equals(role);
            }
            if (path.startsWith("/applications/my")) {
                return "CANDIDATE".equals(role);
            }
            if (path.contains("/shortlist") || path.contains("/reject") ||
                path.contains("/schedule-interview") || path.contains("/status") ||
                path.startsWith("/applications/job/") ||
                path.startsWith("/applications/company/")) {
                return "RECRUITER".equals(role);
            }
        }

        // Job modification rules
        if (path.startsWith("/jobs")) {
            if ("POST".equals(method) || "PUT".equals(method) || "DELETE".equals(method)) {
                return "RECRUITER".equals(role);
            }
        }

        // Company modification rules
        if (path.startsWith("/companies")) {
            if ("POST".equals(method) || "PUT".equals(method) || "DELETE".equals(method)) {
                return "RECRUITER".equals(role);
            }
        }

        // Review rules: Candidates write reviews
        if (path.startsWith("/reviews") && "POST".equals(method)) {
            return "CANDIDATE".equals(role);
        }

        // Interview endpoint rules
        if (path.startsWith("/interviews")) {
            if ("POST".equals(method) || path.contains("/feedback") || path.contains("/cancel")) {
                return "RECRUITER".equals(role);
            }
            if (path.startsWith("/interviews/candidate")) {
                return "CANDIDATE".equals(role);
            }
            if (path.startsWith("/interviews/recruiter")) {
                return "RECRUITER".equals(role);
            }
        }

        // Audit endpoint rules — admin only
        if (path.startsWith("/audit")) {
            return "ADMIN".equals(role);
        }

        return true;
    }

    private HttpServletRequest withHeaders(HttpServletRequest request,
                                           String email, String role, String userId, String companyId) {
        Map<String, String> map = new HashMap<>();
        map.put("X-User-Email", email);
        map.put("X-User-Role",  role);
        map.put("X-User-Id",    userId);
        if (companyId != null && !companyId.isBlank()) {
            map.put("X-Company-Id", companyId);
        }
        final Map<String, String> extra = Collections.unmodifiableMap(map);
        return new HttpServletRequestWrapper(request) {

            @Override public String getHeader(String name) {
                String v = extra.get(name);
                return v != null ? v : super.getHeader(name);
            }

            @Override public Enumeration<String> getHeaders(String name) {
                String v = extra.get(name);
                if (v != null) return Collections.enumeration(List.of(v));
                return super.getHeaders(name);
            }

            @Override public Enumeration<String> getHeaderNames() {
                List<String> names = new ArrayList<>(Collections.list(super.getHeaderNames()));
                names.addAll(extra.keySet());
                return Collections.enumeration(names);
            }
        };
    }

    private void sendError(HttpServletResponse response, int status, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
