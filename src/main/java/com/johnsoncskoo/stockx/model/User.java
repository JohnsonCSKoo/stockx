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
            name = "session_id",
            unique = true
    )
    private String sessionId;

    @OneToOne(
            mappedBy = "user",
            cascade = CascadeType.ALL
    )
    private Portfolio portfolio;
}
