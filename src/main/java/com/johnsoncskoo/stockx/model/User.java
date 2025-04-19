package com.johnsoncskoo.stockx.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User extends AuditableEntity {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            unique = true,
            nullable = false
    )
    private String username;

    @Column(
            unique = true,
            nullable = false
    )
    private String token;

    @OneToOne(
            mappedBy = "user",
            cascade = CascadeType.ALL
    )
    private Portfolio portfolio;

    @Column(
            name = "expires_at",
            unique = true
    )
    private LocalDateTime expiresAt;

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }
}
