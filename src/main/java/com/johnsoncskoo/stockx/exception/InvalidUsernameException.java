package com.johnsoncskoo.stockx.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class InvalidUsernameException extends RuntimeException {
    public InvalidUsernameException(String message) {
        super(message);
    }

    public static InvalidUsernameException toException(String username) {
        return new InvalidUsernameException("Username " + username + " is taken.");
    }
}
