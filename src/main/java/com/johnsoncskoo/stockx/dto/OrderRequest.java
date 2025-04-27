package com.johnsoncskoo.stockx.dto;

import com.johnsoncskoo.stockx.model.OrderDirection;
import com.johnsoncskoo.stockx.model.OrderType;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private String symbol;
    private int quantity;
    private double limitPrice;
    private OrderDirection direction;
    private OrderType type;
}
