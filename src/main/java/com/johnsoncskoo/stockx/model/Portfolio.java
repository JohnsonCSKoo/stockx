package com.johnsoncskoo.stockx.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "portfolios")
public class Portfolio extends AuditableEntity {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    private double balance;

    @OneToMany(
            mappedBy = "portfolio",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Position> positions;

    @OneToOne
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;
}
