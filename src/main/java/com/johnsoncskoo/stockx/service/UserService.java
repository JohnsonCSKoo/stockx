package com.johnsoncskoo.stockx.service;

import com.johnsoncskoo.stockx.dto.CreateUserRequest;
import com.johnsoncskoo.stockx.dto.UserResponse;
import com.johnsoncskoo.stockx.model.User;

public interface UserService {
    UserResponse createUser(CreateUserRequest request);
    User getUser(String token);
    UserResponse getUserDto(String token);
    UserResponse validateUserToken(String token);
    boolean isUserValid(String token);
}
