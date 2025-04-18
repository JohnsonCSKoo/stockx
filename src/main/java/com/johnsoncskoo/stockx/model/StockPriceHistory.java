package com.johnsoncskoo.stockx.model;

import com.johnsoncskoo.stockx.model.keys.StockPriceHistoryId;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stock_price_history")
@IdClass(StockPriceHistoryId.class)
public class StockPriceHistory {
    @Id
    @Column(
            name = "time",
            nullable = false
    )
    private LocalDateTime time;

    @Id
    @ManyToOne
    @JoinColumn(
            name = "stock_id",
            nullable = false
    )
    private Stock stock;

    @Column(
            nullable = false,
            precision = 19,
            scale = 4
    )
    private BigDecimal price;

    private Long volume;
}
