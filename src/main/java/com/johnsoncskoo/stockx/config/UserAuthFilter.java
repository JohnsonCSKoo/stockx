package com.johnsoncskoo.stockx.config;

import com.johnsoncskoo.stockx.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class UserAuthFilter extends OncePerRequestFilter {

    private UserService userService;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var path = request.getRequestURI();
        if (isPublicEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        var authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // Validate token
            var user = userService.validateUserToken(token);

            if (user != null) {
                // Set user attribute in request for downstream use
                request.setAttribute("user", user);
                filterChain.doFilter(request, response);
                return;
            }

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }

    private boolean isPublicEndpoint(String path) {
        return path.equals("/api/v1/users/create") ||
                path.equals("/api/v1/users/validate");
    }
}
