package com.johnsoncskoo.stockx.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockPriceHistoryCache implements Serializable {
    private BigDecimal priceChange;
    private BigDecimal latestPrice;
    private int movementCount;
    private int ticksElapsed;
}