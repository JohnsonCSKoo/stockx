package com.johnsoncskoo.stockx.service.impl;

import com.johnsoncskoo.stockx.dto.DashboardStockDto;
import com.johnsoncskoo.stockx.dto.DashboardStockUpdateDto;
import com.johnsoncskoo.stockx.dto.StockPriceHistoryCache;
import com.johnsoncskoo.stockx.dto.StockUpdateDto;
import com.johnsoncskoo.stockx.model.Stock;
import com.johnsoncskoo.stockx.model.StockPriceHistory;
import com.johnsoncskoo.stockx.repository.StockPriceHistoryRepository;
import com.johnsoncskoo.stockx.repository.StockRepository;
import com.johnsoncskoo.stockx.service.StockDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class StockDataServiceImpl implements StockDataService {
    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository stockPriceHistoryRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    private static final String STOCK_TICKS_KEY = "stock:ticks:%d";

    public void generateStockData() {
        var stocks = stockRepository.findAll();
        var now = LocalDateTime.now();

        var priceHistoryList = new ArrayList<StockPriceHistory>();
        var stockUpdateList = new ArrayList<StockUpdateDto>();

        for (var stock : stocks) {

            BigDecimal latestPrice = null;
            int movementCount = 0;
            int ticksElapsed = 0;
            var cache = getCachedStockPriceHistory(stock.getId());

            // get latest price from cache, or from repository,
            // or initialize with base price if records not available
            if (cache != null) {
                latestPrice = cache.getLatestPrice();
                ticksElapsed = cache.getTicksElapsed();
                movementCount = cache.getMovementCount();
            }

            if (latestPrice == null) {
                latestPrice = stockPriceHistoryRepository.findLatestPrice(stock.getId());
            }

            if (latestPrice == null) {
                latestPrice = stock.getBasePrice();
            }

            // retrieve latest price change
            var changes = calculatePriceChange(stock, latestPrice, movementCount, ticksElapsed);
            movementCount = updateMovement(movementCount, changes.getPriceChange());
            changes.setMovementCount(movementCount);
            changes.setLatestPrice(latestPrice.add(changes.getPriceChange()));

            // store new stock movement in cache
            storeStockPriceHistoryInCache(stock.getId(), changes);

            // add new stock price history record
            var stockPriceHistory = StockPriceHistory.builder()
                    .stock(stock)
                    .price(changes.getLatestPrice())
                    .time(now)
                    .volume(100_000L)   // random-ify volume if needed in the future
                    .build();
            priceHistoryList.add(stockPriceHistory);

            // add stock update to list
            var stockUpdate = StockUpdateDto.builder()
                    .stockId(stock.getId())
                    .price(changes.getLatestPrice())
                    .time(now)
                    .build();
            stockUpdateList.add(stockUpdate);
        }

        stockPriceHistoryRepository.saveAll(priceHistoryList);

        // push stock updates to WS clients
        stockUpdateList.forEach(update ->
                messagingTemplate.convertAndSend("/topic/stock/" + update.getStockId(), update));
        messagingTemplate.convertAndSend("/topic/stocks/", stockUpdateList);
    }

    @Override
    public void getDashboardHCOLData() {
        var stocks = stockRepository.findAll();
        var now = LocalDateTime.now();
        var startOfYesterday = LocalDateTime.now()
                .minusDays(1)
                .toLocalDate()
                .atStartOfDay();
        var startOfToday = LocalDateTime.now()
                .toLocalDate()
                .atStartOfDay();

        var stockUpdateList = new ArrayList<DashboardStockDto>();

        // calculate HCOL and price change of each stock
        for (var stock : stocks) {
            var dailyHCOL = stockPriceHistoryRepository.findDailyOHLC(
                    stock, startOfYesterday, startOfToday);

            if (dailyHCOL == null || dailyHCOL.isEmpty()) {
                continue;
            }

            var stockUpdate = DashboardStockDto.builder()
                    .stockId(stock.getId())
                    .lastUpdatedAt(now)
                    .high((BigDecimal) dailyHCOL.get(1))
                    .low((BigDecimal) dailyHCOL.get(2))
                    .open((BigDecimal) dailyHCOL.get(3))
                    .close((BigDecimal) dailyHCOL.get(4))
                    .price((BigDecimal) dailyHCOL.get(5))
                    .build();

            var priceChange = stockUpdate.getPrice().subtract(stockUpdate.getClose());
            var priceChangePercentage = BigDecimal.ZERO;

            if (stockUpdate.getClose().compareTo(BigDecimal.ZERO) != 0) {
                priceChangePercentage = priceChange
                        .divide(stockUpdate.getClose(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
            stockUpdate.setPriceChange(priceChange);
            stockUpdate.setPriceChangePercentage(priceChangePercentage);
            stockUpdateList.add(stockUpdate);
        }

        // push daily stock HCOL data to WS clients
        messagingTemplate.convertAndSend("/topic/dashboard/",
                DashboardStockUpdateDto.builder().stocks(stockUpdateList).build());
    }

    private StockPriceHistoryCache calculatePriceChange(Stock stock, BigDecimal latestPrice, int movementCount, int ticksElapsed) {

        // generate random movement:
        // 1. ±0.5% per tick
        // 2. for every 10 ticks, chance for ±1% movement
        // 3. for every 100 ticks, chance for ±3% movement
        // 4. if same movement for more than 10 ticks, double the chance for opposing movement
        // 5. price will never be less than 20% of base price
        // 6. price will never be more than 200% of base price
        // 7. if price is within 30% of base price, increase chance for +3% movement
        // 8. if price is within 180% of base price, increase chance for -3% movement

        BigDecimal priceChange = null;

        // Check if the current price is within specific ranges and adjust accordingly
        if (latestPrice.compareTo(stock.getBasePrice().multiply(BigDecimal.valueOf(0.2))) <= 0) {
            // Force an increase of 1-3%
            priceChange = latestPrice.multiply(BigDecimal.valueOf(0.01 + random.nextDouble() * 0.02));
        } else if (latestPrice.compareTo(stock.getBasePrice().multiply(BigDecimal.valueOf(2))) >= 0) {
            // Force a decrease of 1-3%
            priceChange = latestPrice.multiply(BigDecimal.valueOf(0.01 + random.nextDouble() * 0.02)).negate();
        } else if (latestPrice.compareTo(stock.getBasePrice().multiply(BigDecimal.valueOf(0.3))) <= 0 && random.nextInt(3) == 0) {
            // Increase chance for +3%
            priceChange = latestPrice.multiply(BigDecimal.valueOf(random.nextDouble() * 0.03));
        } else if (latestPrice.compareTo(stock.getBasePrice().multiply(BigDecimal.valueOf(1.8))) >= 0 && random.nextInt(3) == 0) {
            // Increase chance for -3%
            priceChange = latestPrice.multiply(BigDecimal.valueOf(random.nextDouble() * 0.03)).negate();
        }

        if (priceChange != null) {
            ticksElapsed = 1;
            return StockPriceHistoryCache.builder()
                    .priceChange(priceChange)
                    .ticksElapsed(ticksElapsed)
                    .build();
        }

        // chance for ±3% movement at 100 ticks
        if (ticksElapsed >= 99 && random.nextBoolean()) {
            priceChange = latestPrice.multiply(BigDecimal.valueOf(random.nextDouble() * 0.03));
            if (random.nextBoolean()) {
                priceChange = priceChange.negate();
            }
            ticksElapsed = 1;

            return StockPriceHistoryCache.builder()
                    .priceChange(priceChange)
                    .ticksElapsed(ticksElapsed)
                    .build();
        }
        // chance for ±1% movement at 10 ticks
        else if (ticksElapsed >= 10 && ticksElapsed % 10 == 0 && random.nextBoolean()) {
            priceChange = latestPrice.multiply(BigDecimal.valueOf(random.nextDouble() * 0.01));
        }
        // normal price change of ±0.3%
        else {
            priceChange = latestPrice.multiply(BigDecimal.valueOf(random.nextDouble() * 0.005));
        }

        // if movement is the same for more than 10 ticks, double the chance for opposing movement
        if (movementCount >= 10 && priceChange.compareTo(BigDecimal.ZERO) >= 0 && random.nextBoolean()) {
            priceChange = priceChange.abs().negate();
        }
        else if (movementCount <= -10 && priceChange.compareTo(BigDecimal.ZERO) < 0 && random.nextBoolean()) {
            priceChange = priceChange.abs();
        }
        else if (random.nextBoolean()) {
            priceChange = priceChange.negate();
        }

        return StockPriceHistoryCache.builder()
                .priceChange(priceChange)
                .ticksElapsed(ticksElapsed)
                .build();
    }

    private static int updateMovement(int movementCount, BigDecimal priceChange) {
        if (movementCount < 0 && priceChange.compareTo(BigDecimal.ZERO) >= 0 ||
                movementCount > 0 && priceChange.compareTo(BigDecimal.ZERO) < 0) {
            movementCount = 0;
        }
        movementCount += priceChange.compareTo(BigDecimal.ZERO) >= 0 ? 1 : -1;
        return movementCount;
    }

    private StockPriceHistoryCache getCachedStockPriceHistory(long stockId) {
        var key = String.format(STOCK_TICKS_KEY, stockId);
        Object value = redisTemplate.opsForValue().get(key);
        if (value == null) {
            return null;
        }
        return value instanceof StockPriceHistoryCache ? (StockPriceHistoryCache) value : null;
    }

    private void storeStockPriceHistoryInCache(long stockId, StockPriceHistoryCache stockPriceHistoryCache) {
        var key = String.format(STOCK_TICKS_KEY, stockId);
        redisTemplate.opsForValue().set(key, stockPriceHistoryCache, Duration.ofHours(1));
    }

    private void removeStockPriceHistoryFromCache(long stockId) {
        var key = String.format(STOCK_TICKS_KEY, stockId);
        redisTemplate.delete(key);
    }
}
