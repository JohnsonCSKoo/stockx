package com.johnsoncskoo.stockx.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStockUpdateDto {
    public List<DashboardStockDto> stocks;
}
