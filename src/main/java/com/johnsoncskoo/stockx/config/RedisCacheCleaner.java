package com.johnsoncskoo.stockx.config;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class RedisCacheCleaner {
    private final RedisTemplate<String, Object> redisTemplate;

    public RedisCacheCleaner(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        registerShutdownHook();
    }

    private void registerShutdownHook() {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Clearing Redis caches...");
            clearAllStockCaches();
        }));
    }

    public void clearAllStockCaches() {
        Set<String> keys = redisTemplate.keys("stock:ticks:*");
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}
