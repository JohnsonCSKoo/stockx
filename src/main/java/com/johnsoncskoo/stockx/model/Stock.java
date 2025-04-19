package com.johnsoncskoo.stockx.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stocks")
public class Stock extends AuditableEntity {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private long id;

    @Column(
            unique = true,
            nullable = false
    )
    private String symbol;

    @Column(
            nullable = false
    )
    private String name;

    @Column(
            name = "base_price",
            nullable = false
    )
    private BigDecimal basePrice;
}
