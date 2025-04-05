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
@Table(name = "orders")
public class Order extends AuditableEntity {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
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
            name = "user_id",
            nullable = false
    )
    private User user;

    private int quantity;

    @Column(name = "limit_price")
    private double limitPrice;

    @Column(name = "executed_price")
    private double executedPrice;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    private OrderDirection direction;

    private OrderType type;

    private OrderStatus status;
}
