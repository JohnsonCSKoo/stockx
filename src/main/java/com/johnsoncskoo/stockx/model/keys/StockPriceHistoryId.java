package com.johnsoncskoo.stockx.model.keys;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class StockPriceHistoryId implements Serializable {
    private LocalDateTime time;
    private Long stock;
}
