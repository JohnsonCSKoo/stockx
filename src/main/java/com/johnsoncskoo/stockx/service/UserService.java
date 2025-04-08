package com.johnsoncskoo.stockx.service;

import com.johnsoncskoo.stockx.dto.CreateUserRequest;
import com.johnsoncskoo.stockx.dto.UserResponse;
import com.johnsoncskoo.stockx.model.User;
import jakarta.servlet.http.HttpSession;

public interface UserService {
    UserResponse createUser(HttpSession session, CreateUserRequest request);
    User getUser(HttpSession session);
    boolean isUserLoggedIn(HttpSession session);
}
