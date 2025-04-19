package com.johnsoncskoo.stockx.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class StockController {

    @MessageMapping("/subscribe/all")
    @SendTo("/topic/stocks")
    public String subscribeToStocks() {
        return "Subscribed to all stock updates.";
    }

    @MessageMapping("/subscribe/{id}")
    @SendTo("/topic/stock/{id}")
    public String subscribeToStock(@DestinationVariable String id) {
        return "Subscribed to stock ID " + id + " updates.";
    }

    @MessageMapping("/subscribe/dashboard")
    @SendTo("/topic/dashboard")
    public String subscribeToDashboardStocks() {
        return "Subscribed to dashboard stock updates.";
    }
}
