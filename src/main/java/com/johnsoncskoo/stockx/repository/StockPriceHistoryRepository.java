package com.johnsoncskoo.stockx.repository;

import com.johnsoncskoo.stockx.model.Stock;
import com.johnsoncskoo.stockx.model.StockPriceHistory;
import com.johnsoncskoo.stockx.model.keys.StockPriceHistoryId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface StockPriceHistoryRepository extends JpaRepository<StockPriceHistory, StockPriceHistoryId> {
    List<StockPriceHistory> findByStock(Stock stock);

    Page<StockPriceHistory> findByStock(Stock stock, Pageable pageable);

    List<StockPriceHistory> findByStockAndTimeBetweenOrderByTimeAsc(
            Stock stock, LocalDateTime startTime, LocalDateTime endTime);

    StockPriceHistory findFirstByStockOrderByTimeDesc(Stock stock);

    void deleteByTimeBefore(LocalDateTime time);

    long countByStock(Stock stock);

    @Query("SELECT new map(FUNCTION('date_trunc', 'day', s.time) as day, " +
            "MAX(s.price) as high, MIN(s.price) as low, " +
            "FIRST_VALUE(s.price) OVER (PARTITION BY FUNCTION('date_trunc', 'day', s.time) ORDER BY s.time) as open, " +
            "LAST_VALUE(s.price) OVER (PARTITION BY FUNCTION('date_trunc', 'day', s.time) ORDER BY s.time) as close) " +
            "FROM StockPriceHistory s WHERE s.stock = :stock AND s.time BETWEEN :startDate AND :endDate " +
            "GROUP BY FUNCTION('date_trunc', 'day', s.time) ORDER BY day")
    List<Object> findDailyOHLC(@Param("stock") Stock stock,
                               @Param("startDate") LocalDateTime startDate,
                               @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT * FROM (" +
            "SELECT time, stock_id, price, volume FROM stock_price_history " +
            "WHERE stock_id = :stockId AND time > :oneDayAgo " +
            "UNION ALL " +
            "SELECT bucket AS time, stock_id, open AS price, volume FROM stock_price_5min " +
            "WHERE stock_id = :stockId AND bucket BETWEEN :oneWeekAgo AND :oneDayAgo " +
            "UNION ALL " +
            "SELECT bucket AS time, stock_id, open AS price, volume FROM stock_price_1hour " +
            "WHERE stock_id = :stockId AND bucket < :oneWeekAgo AND bucket > :startTime " +
            ") combined_data " +
            "ORDER BY time ASC " +
            "LIMIT 500", nativeQuery = true)
    List<Object[]> findFor5MinChart(
            @Param("stockId") Long stockId,
            @Param("oneDayAgo") LocalDateTime oneDayAgo,
            @Param("oneWeekAgo") LocalDateTime oneWeekAgo,
            @Param("startTime") LocalDateTime startTime);

    @Query(value = "SELECT * FROM (" +
            "SELECT time_bucket('1 hour', time) AS bucket, stock_id, " +
            "FIRST(price, time) AS open, MAX(price) AS high, MIN(price) AS low, " +
            "LAST(price, time) AS close, SUM(volume) AS volume " +
            "FROM stock_price_history " +
            "WHERE stock_id = :stockId AND time > :oneDayAgo " +
            "GROUP BY bucket, stock_id " +
            "UNION ALL " +
            "SELECT bucket, stock_id, open, high, low, close, volume FROM stock_price_1hour " +
            "WHERE stock_id = :stockId AND bucket <= :oneDayAgo AND bucket > :startTime " +
            ") combined_data " +
            "ORDER BY bucket ASC " +
            "LIMIT 500", nativeQuery = true)
    List<Object[]> findFor1HourChart(
            @Param("stockId") Long stockId,
            @Param("oneDayAgo") LocalDateTime oneDayAgo,
            @Param("startTime") LocalDateTime startTime);

    @Query(value = "SELECT * FROM (" +
            "SELECT time_bucket('1 day', time) AS bucket, stock_id, " +
            "FIRST(price, time) AS open, MAX(price) AS high, MIN(price) AS low, " +
            "LAST(price, time) AS close, SUM(volume) AS volume " +
            "FROM stock_price_history " +
            "WHERE stock_id = :stockId AND time > :oneDayAgo " +
            "GROUP BY bucket, stock_id " +
            "UNION ALL " +
            "SELECT time_bucket('1 day', bucket) AS day_bucket, stock_id, " +
            "FIRST(open ORDER BY bucket), MAX(high), MIN(low), LAST(close ORDER BY bucket), SUM(volume) " +
            "FROM stock_price_1hour " +
            "WHERE stock_id = :stockId AND bucket <= :oneDayAgo AND bucket > :startTime " +
            "GROUP BY day_bucket, stock_id " +
            ") combined_data " +
            "ORDER BY bucket ASC " +
            "LIMIT 365", nativeQuery = true)
    List<Object[]> findFor1DayChart(
            @Param("stockId") Long stockId,
            @Param("oneDayAgo") LocalDateTime oneDayAgo,
            @Param("startTime") LocalDateTime startTime);

    @Query(value = "SELECT time_bucket('1 week', bucket) AS week_bucket, stock_id, " +
            "FIRST(open ORDER BY bucket), MAX(high), MIN(low), LAST(close ORDER BY bucket), SUM(volume) " +
            "FROM stock_price_1hour " +
            "WHERE stock_id = :stockId AND bucket > :startTime " +
            "GROUP BY week_bucket, stock_id " +
            "ORDER BY week_bucket ASC " +
            "LIMIT 260", nativeQuery = true)
    List<Object[]> findFor1WeekChart(
            @Param("stockId") Long stockId,
            @Param("startTime") LocalDateTime startTime);

    @Query(value = "SELECT time_bucket('1 month', bucket) AS month_bucket, stock_id, " +
            "FIRST(open ORDER BY bucket), MAX(high), MIN(low), LAST(close ORDER BY bucket), SUM(volume) " +
            "FROM stock_price_1hour " +
            "WHERE stock_id = :stockId AND bucket > :startTime " +
            "GROUP BY month_bucket, stock_id " +
            "ORDER BY month_bucket ASC " +
            "LIMIT 60", nativeQuery = true)
    List<Object[]> findForMonthlyChart(
            @Param("stockId") Long stockId,
            @Param("startTime") LocalDateTime startTime);

    @Query(value = "SELECT price FROM stock_price_history " +
            "WHERE stock_id = :stockId " +
            "ORDER BY time DESC LIMIT 1", nativeQuery = true)
    BigDecimal findLatestPrice(@Param("stockId") Long stockId);

    @Query(value = "SELECT MIN(time) FROM stock_price_history " +
            "WHERE stock_id = :stockId", nativeQuery = true)
    LocalDateTime findEarliestStockHistoryDate(@Param("stockId") Long stockId);

    // For data older than 1 day but newer than 1 week, use 5-min continuous aggregate
    @Query(value = "SELECT bucket AS time, stock_id, open AS price, volume " +
            "FROM stock_price_5min " +
            "WHERE stock_id = :stockId " +
            "AND bucket BETWEEN :startTime AND :endTime " +
            "ORDER BY bucket ASC", nativeQuery = true)
    List<Object[]> findCompressed5MinData(
            @Param("stockId") Long stockId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    // For data older than 1 week, use 1-hour continuous aggregate
    @Query(value = "SELECT bucket AS time, stock_id, open AS price, volume " +
            "FROM stock_price_1hour " +
            "WHERE stock_id = :stockId " +
            "AND bucket < :cutoffTime " +
            "ORDER BY bucket ASC", nativeQuery = true)
    List<Object[]> findCompressed1HourData(
            @Param("stockId") Long stockId,
            @Param("cutoffTime") LocalDateTime cutoffTime);

    @Query(value = "SELECT * FROM (" +
            "SELECT time, stock_id, price, volume FROM stock_price_history " +
            "WHERE stock_id = :stockId AND time > :oneDayAgo " +
            "UNION ALL " +
            "SELECT bucket AS time, stock_id, open AS price, volume FROM stock_price_5min " +
            "WHERE stock_id = :stockId AND bucket BETWEEN :oneWeekAgo AND :oneDayAgo " +
            "UNION ALL " +
            "SELECT bucket AS time, stock_id, open AS price, volume FROM stock_price_1hour " +
            "WHERE stock_id = :stockId AND bucket < :oneWeekAgo " +
            ") combined_data " +
            "ORDER BY time ASC " +
            "LIMIT 2000", nativeQuery = true)
    List<Object[]> findHistoricalData(
            @Param("stockId") Long stockId,
            @Param("oneDayAgo") LocalDateTime oneDayAgo,
            @Param("oneWeekAgo") LocalDateTime oneWeekAgo);
}
