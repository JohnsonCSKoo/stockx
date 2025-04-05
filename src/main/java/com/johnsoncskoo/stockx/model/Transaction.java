package com.johnsoncskoo.stockx.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "transactions")
public class Transaction extends AuditableEntity {
    @Id
    @GeneratedValue(
            strategy = GenerationType.UUID
    )
    private String id;

    @ManyToOne
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne
    @JoinColumn(
            name = "order_id",
            nullable = false
    )
    private Order order;

    private TransactionType type;

    private int quantity;

    @Column(name = "price_per_unit")
    private double pricePerUnit;

    private double total;
}
