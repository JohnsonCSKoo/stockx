package com.johnsoncskoo.stockx.worker;

import com.johnsoncskoo.stockx.service.TradeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TradeWorker {

    private final TradeService tradeService;

    @Scheduled(fixedRate = 5000)
    public void startScheduler() {
        tradeService.processTradeEvents();
    }
}
