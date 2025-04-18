package com.johnsoncskoo.stockx.config;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TimescaleInitService {
    private EntityManager entityManager;
    private JdbcTemplate jdbcTemplate;

    @Transactional
    public void initializeTimescaleDb() {
        entityManager.createNativeQuery(
                "CREATE EXTENSION IF NOT EXISTS timescaledb;"
        ).executeUpdate();

        entityManager.createNativeQuery(
                "CREATE TABLE IF NOT EXISTS stock_price_history (" +
                        "stock_id BIGINT NOT NULL, " +
                        "time TIMESTAMPTZ NOT NULL, " +
                        "price DECIMAL(19,4) NOT NULL, " +
                        "volume BIGINT, " +
                        "PRIMARY KEY (stock_id, time)" +
                        ");"
        ).executeUpdate();

        entityManager.createNativeQuery(
                "SELECT create_hypertable('stock_price_history', 'time', if_not_exists => TRUE);"
        ).getSingleResult();

        // Configure TimescaleDB compression
        entityManager.createNativeQuery(
                "ALTER TABLE stock_price_history SET (timescaledb.compress, " +
                        "timescaledb.compress_segmentby = 'stock_id');"
        ).executeUpdate();
    }

    public void createAggregates() {
        // Set up 5-min aggregates
        jdbcTemplate.execute(
                "CREATE MATERIALIZED VIEW IF NOT EXISTS stock_price_5min " +
                        "WITH (timescaledb.continuous) AS " +
                        "SELECT time_bucket('5 minutes', time) AS bucket, " +
                        "stock_id, " +
                        "FIRST(price, time) AS open, " +
                        "MAX(price) AS high, " +
                        "MIN(price) AS low, " +
                        "LAST(price, time) AS close, " +
                        "SUM(volume) AS volume " +
                        "FROM stock_price_history " +
                        "GROUP BY bucket, stock_id;"
        );

        // Set up 1-hr aggregates
        jdbcTemplate.execute(
                "CREATE MATERIALIZED VIEW IF NOT EXISTS stock_price_1hour " +
                        "WITH (timescaledb.continuous) AS " +
                        "SELECT time_bucket('1 hour', time) AS bucket, " +
                        "stock_id, " +
                        "FIRST(price, time) AS open, " +
                        "MAX(price) AS high, " +
                        "MIN(price) AS low, " +
                        "LAST(price, time) AS close, " +
                        "SUM(volume) AS volume " +
                        "FROM stock_price_history " +
                        "GROUP BY bucket, stock_id;"
        );

        // remove and readd retention policies
        try {
            jdbcTemplate.execute(
                    "SELECT remove_retention_policy('stock_price_history', if_exists => true)"
            );
            jdbcTemplate.execute(
                    "SELECT remove_retention_policy('stock_price_5min', if_exists => true)"
            );
        } catch (Exception e) {
            System.out.println("Warning when removing existing retention policies: " + e.getMessage());
        }

        jdbcTemplate.execute(
                "SELECT add_retention_policy('stock_price_history', INTERVAL '7 days');"
        );

        jdbcTemplate.execute(
                "SELECT add_retention_policy('stock_price_5min', INTERVAL '30 days');"
        );

        // remove and readd refresh policies
        try {
            jdbcTemplate.execute(
                    "SELECT remove_continuous_aggregate_policy('stock_price_5min', if_exists => true)"
            );
            jdbcTemplate.execute(
                    "SELECT remove_continuous_aggregate_policy('stock_price_1hour', if_exists => true)"
            );
        } catch (Exception e) {
            System.out.println("Warning when removing existing refresh policies: " + e.getMessage());
        }

        jdbcTemplate.execute(
                "SELECT add_continuous_aggregate_policy('stock_price_5min', " +
                        "start_offset => INTERVAL '2 days', " +
                        "end_offset => INTERVAL '1 hour', " +
                        "schedule_interval => INTERVAL '1 hour');"
        );

        jdbcTemplate.execute(
                "SELECT add_continuous_aggregate_policy('stock_price_1hour', " +
                        "start_offset => INTERVAL '8 days', " +
                        "end_offset => INTERVAL '1 day', " +
                        "schedule_interval => INTERVAL '6 hours');"
        );

        // Remove and readd compression policy
        try {
            jdbcTemplate.execute(
                    "SELECT remove_compression_policy('stock_price_history', if_exists => true)"
            );
        } catch (Exception e) {
            System.out.println("Warning when removing existing compression policy: " + e.getMessage());
        }

        jdbcTemplate.execute(
                "SELECT add_compression_policy('stock_price_history', INTERVAL '1 day');"
        );
    }
}
