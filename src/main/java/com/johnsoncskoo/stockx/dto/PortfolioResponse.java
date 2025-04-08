package com.johnsoncskoo.stockx.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioResponse {
    private long id;
    private double balance;
    private List<PositionDto> positions;
}
