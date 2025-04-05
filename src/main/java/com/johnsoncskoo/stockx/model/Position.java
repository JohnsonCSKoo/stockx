package com.johnsoncskoo.stockx.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "positions")
public class Position extends AuditableEntity {
    @Id
    @GeneratedValue(
            strategy = jakarta.persistence.GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne
    @JoinColumn(
            name = "stock_id",
            nullable = false
    )
    private Stock stock;

    @ManyToOne
    @JoinColumn(
            nullable = false
    )
    private Portfolio portfolio;

    private int quantity;

    private int averageCost;
}
