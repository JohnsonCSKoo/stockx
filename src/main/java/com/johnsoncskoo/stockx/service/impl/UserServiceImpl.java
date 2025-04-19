package com.johnsoncskoo.stockx.service.impl;

import com.johnsoncskoo.stockx.dto.CreateUserRequest;
import com.johnsoncskoo.stockx.dto.UserResponse;
import com.johnsoncskoo.stockx.exception.InvalidUsernameException;
import com.johnsoncskoo.stockx.exception.SessionNotFoundException;
import com.johnsoncskoo.stockx.model.Portfolio;
import com.johnsoncskoo.stockx.model.User;
import com.johnsoncskoo.stockx.repository.PortfolioRepository;
import com.johnsoncskoo.stockx.repository.UserRepository;
import com.johnsoncskoo.stockx.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;

    private static final int EXPIRATION_HOURS = 24;

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
            throw new InvalidUsernameException("Username already exists");
        }

        String newToken;

        try {
            newToken = generateToken(request.getUsername());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate token", e);
        }

        var user = User.builder()
                .token(newToken)
                .username(request.getUsername())
                .expiresAt(LocalDateTime.now().plusHours(EXPIRATION_HOURS))
                .build();

        user = userRepository.save(user);

        var portfolio = Portfolio.builder()
                .user(user)
                .balance(100_000.00)
                .positions(new ArrayList<>())
                .build();

        portfolio = portfolioRepository.save(portfolio);

        return new UserResponse(user.getId(), user.getUsername(), user.getToken(), user.getExpiresAt());
    }

    @Override
    public User getUser(String token) {
        var user = userRepository.findByToken(token);
        if (user == null) {
            throw SessionNotFoundException.toException(token);
        }
        return user;
    }

    @Override
    public UserResponse getUserDto(String token) {
        var user = getUser(token);
        if (user == null) {
            throw SessionNotFoundException.toException(token);
        }
        return new UserResponse(user.getId(), user.getUsername(), user.getToken(), user.getExpiresAt());
    }

    @Override
    public UserResponse validateUserToken(String token) {
        if (!isUserValid(token)) {
            return null;
        }

        var user = userRepository.findByToken(token);
        if (user == null) {
            throw SessionNotFoundException.toException(token);
        }

        return new UserResponse(user.getId(), user.getUsername(), user.getToken(), user.getExpiresAt());
    }

    @Override
    public boolean isUserValid(String token) {
        if (userRepository.existsByToken(token)) {
            var user = userRepository.findByToken(token);
            if (user != null) {
                return !user.isExpired();
            }
        }
        return false;
    }

    private String generateToken(String username) throws NoSuchAlgorithmException {
        // generate a random SHA-512 hash based on current timestamp and username
        var now = System.currentTimeMillis();
        var key = now + username;

        // hash generation logic
        var md = MessageDigest.getInstance("SHA-512");
        byte[] messageDigest = md.digest(key.getBytes());
        BigInteger no = new BigInteger(1, messageDigest);
        StringBuilder hash = new StringBuilder(no.toString(16));
        while (hash.length() < 128) {
            hash.insert(0, "0");
        }

        return hash.toString();
    }
}
