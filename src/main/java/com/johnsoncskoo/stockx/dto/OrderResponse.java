package com.johnsoncskoo.stockx.dto;

import com.johnsoncskoo.stockx.model.OrderDirection;
import com.johnsoncskoo.stockx.model.OrderStatus;
import com.johnsoncskoo.stockx.model.OrderType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String symbol;
    private int quantity;
    private double limitPrice;
    private double executedPrice;
    private OrderStatus status;
    private OrderType type;
    private OrderDirection direction;
    private LocalDateTime createdAt;
    private LocalDateTime executedAt;
}
