package com.johnsoncskoo.stockx.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    @NotEmpty
    @Length(min = 3, max = 16)
    private String username;
}
