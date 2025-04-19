package com.johnsoncskoo.stockx.seeder;

import com.johnsoncskoo.stockx.model.Stock;
import com.johnsoncskoo.stockx.repository.StockRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class StockSeeder {
    private final StockRepository stockRepository;

    @PostConstruct
    public void seedStocks() {
        // terminate seeder if there are existing stocks
        if (stockRepository.count() > 0) {
            return;
        }

        var stockList = Arrays.asList(
                createStock("AAPL", "Apple Inc.", 180.50),
                createStock("MSFT", "Microsoft Corporation", 380.25),
                createStock("GOOGL", "Alphabet Inc.", 160.75),
                createStock("AMZN", "Amazon.com Inc.", 175.30),
                createStock("NVDA", "NVIDIA Corporation", 825.60),
                createStock("META", "Meta Platforms Inc.", 480.40),
                createStock("TSLA", "Tesla Inc.", 190.75),
                createStock("NFLX", "Netflix Inc.", 930.00),
                createStock("AMD", "Advance Micro Devices", 87.40),
                createStock("INTC", "Intel Corp.", 18.90),
                createStock("SPX:IND", "S&P 500", 5282.70),
                createStock("DJIA:IND", "Dow Jones Industrial Average", 39142.20),
                createStock("IXIC:IND", "Nasdaq Composite", 16286.50),
                createStock("RUT:IND", "Russell 2000 Index", 1880.60),
                createStock("VIX:IND", "CBOE Volatility Index", 29.60)
        );

        stockRepository.saveAll(stockList);
    }

    private Stock createStock(String symbol, String name, double basePrice) {
        return Stock.builder()
                .name(name)
                .basePrice(BigDecimal.valueOf(basePrice))
                .symbol(symbol)
                .build();
    }
}
