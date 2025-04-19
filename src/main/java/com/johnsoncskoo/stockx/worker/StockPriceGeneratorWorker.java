package com.johnsoncskoo.stockx.worker;

import com.johnsoncskoo.stockx.service.StockDataGeneratorService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class StockPriceGeneratorWorker {
    private final ScheduledExecutorService scheduler =
            Executors.newScheduledThreadPool(1);
    private final StockDataGeneratorService stockDataGeneratorService;

    @PostConstruct
    public void startScheduler() {
        scheduler.scheduleAtFixedRate(
                stockDataGeneratorService::generateStockData,
                0, 5, TimeUnit.SECONDS);
    }

    @PreDestroy
    public void stopScheduler() {
        scheduler.shutdown();
    }
}