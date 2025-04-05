package com.johnsoncskoo.stockx.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class SessionNotFoundException extends RuntimeException {
    public SessionNotFoundException(String message) {
        super(message);
    }

    public static SessionNotFoundException toException(String sessionId) {
        return new SessionNotFoundException("Existing user for session " + sessionId + " not found.");
    }
}
