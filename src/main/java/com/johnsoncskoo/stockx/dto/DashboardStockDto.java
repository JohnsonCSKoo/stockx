package com.johnsoncskoo.stockx.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Getter
@Setter
@Builder
public class DashboardStockDto {
    private String symbol;
    private String name;
    private long stockId;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal open;
    private BigDecimal close;
    private int volume;
    private BigDecimal price;
    private BigDecimal priceChange;
    private BigDecimal priceChangePercentage;
    private LocalDateTime lastUpdatedAt;
}
