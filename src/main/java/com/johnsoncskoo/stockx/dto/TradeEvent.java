package com.johnsoncskoo.stockx.dto;

import com.johnsoncskoo.stockx.model.OrderDirection;
import com.johnsoncskoo.stockx.model.OrderType;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeEvent {
    private long orderId;
    private long stockId;
    private long userId;
    private int quantity;
    private String symbol;
    private OrderDirection direction;
    private OrderType type;
    private double limitPrice;
}
