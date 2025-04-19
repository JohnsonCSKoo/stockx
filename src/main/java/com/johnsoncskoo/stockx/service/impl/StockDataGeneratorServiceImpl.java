package com.johnsoncskoo.stockx.service.impl;

import com.johnsoncskoo.stockx.dto.StockPriceHistoryCache;
import com.johnsoncskoo.stockx.model.Stock;
import com.johnsoncskoo.stockx.model.StockPriceHistory;
import com.johnsoncskoo.stockx.repository.StockPriceHistoryRepository;
import com.johnsoncskoo.stockx.repository.StockRepository;
import com.johnsoncskoo.stockx.service.StockDataGeneratorService;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class StockDataGeneratorServiceImpl implements StockDataGeneratorService {
    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository stockPriceHistoryRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final Random random = new Random();

    private static final String STOCK_TICKS_KEY = "stock:ticks:%d";

    public void generateStockData() {
        var stocks = stockRepository.findAll();
        var now = LocalDateTime.now();

        var priceHistoryList = new ArrayList<StockPriceHistory>();

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
        }

        stockPriceHistoryRepository.saveAll(priceHistoryList);
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
