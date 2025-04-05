package com.johnsoncskoo.stockx.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException toException(Class<?> entityType, Object id) {
        return new ResourceNotFoundException("No " + entityType.getSimpleName().toLowerCase() + " exists with the id: " + id);
    }
    public static ResourceNotFoundException toException(Class<?> entityType) {
        return new ResourceNotFoundException("Entity " + entityType.getSimpleName().toLowerCase() + " does not exist.");
    }
}
