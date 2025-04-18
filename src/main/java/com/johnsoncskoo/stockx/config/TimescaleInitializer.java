package com.johnsoncskoo.stockx.config;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class TimescaleInitializer implements CommandLineRunner {

    private final TimescaleInitService timescaleInitService;

    @Override
    public void run(String... args) throws Exception {
        timescaleInitService.initializeTimescaleDb();
        System.out.println("TimescaleDB created successfully.");

        timescaleInitService.createAggregates();
        System.out.println("TimescaleDB configured successfully.");
    }

}
