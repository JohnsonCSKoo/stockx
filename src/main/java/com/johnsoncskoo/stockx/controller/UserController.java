package com.johnsoncskoo.stockx.controller;

import com.johnsoncskoo.stockx.dto.CreateUserRequest;
import com.johnsoncskoo.stockx.dto.UserResponse;
import com.johnsoncskoo.stockx.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin("*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

//    @PostMapping("/create")
//    public ResponseEntity<UserResponse> createUser(
//            @RequestBody @Validated final CreateUserRequest userRequest
//    ) {
//        var response = userService.createUser(userRequest);
//
//        return ResponseEntity.ok(response);
//    }
}
