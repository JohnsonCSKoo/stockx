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
public class StockUpdateDto {
    private long stockId;
    private BigDecimal price;
    private LocalDateTime time;
}
