package com.johnsoncskoo.stockx.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionDto {
    private long positionId;
    private long stockId;
    private String stockName;
    private String stockSymbol;
    private int quantity;
    private double averagePrice;
    private double currentPrice;
    private double totalValue;
}
