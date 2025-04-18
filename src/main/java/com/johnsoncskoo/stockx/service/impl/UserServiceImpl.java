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

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;

    @Override
    public UserResponse createUser(HttpSession session, CreateUserRequest request) {
        var sessionId = session.getId();

        var user = userRepository.findBySessionId(sessionId);

        if (user == null) {
            if (userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
                throw new InvalidUsernameException("Username already exists");
            }

            user = User.builder()
                    .sessionId(sessionId)
                    .username(request.getUsername())
                    .build();

            user = userRepository.save(user);

            var portfolio = Portfolio.builder()
                    .user(user)
                    .balance(100_000.00)
                    .positions(new ArrayList<>())
                    .build();

            portfolio = portfolioRepository.save(portfolio);
        }

        return new UserResponse(user.getId(), user.getUsername(), user.getSessionId());
    }

    @Override
    public User getUser(String sessionId) {
        var user = userRepository.findBySessionId(sessionId);
        if (user == null) {
            throw SessionNotFoundException.toException(sessionId);
        }
        return user;
    }

    @Override
    public boolean isUserLoggedIn(String sessionId) {
        return userRepository.existsBySessionId(sessionId);
    }
}
