package com.johnsoncskoo.stockx.service.impl;

import com.johnsoncskoo.stockx.dto.OrderRequest;
import com.johnsoncskoo.stockx.dto.OrderResponse;
import com.johnsoncskoo.stockx.exception.InsufficientFundsException;
import com.johnsoncskoo.stockx.exception.ResourceNotFoundException;
import com.johnsoncskoo.stockx.model.*;
import com.johnsoncskoo.stockx.repository.OrderRepository;
import com.johnsoncskoo.stockx.repository.StockRepository;
import com.johnsoncskoo.stockx.service.TradeService;
import com.johnsoncskoo.stockx.service.UserService;
import com.johnsoncskoo.stockx.service.dto.TradeEvent;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TradeServiceImpl implements TradeService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final OrderRepository orderRepository;
    private final StockRepository stockRepository;

    private final UserService userService;

    @Override
    public OrderResponse submitOrder(HttpSession session, OrderRequest request) {
        var user = userService.getUser(session);
        var stock = stockRepository.findById(request.getStockId())
                .orElseThrow(() -> ResourceNotFoundException.toException(Stock.class, request.getStockId()));

        var order = Order.builder()
                .user(user)
                .stock(stock)
                .direction(request.getDirection())
                .type(request.getType())
                .limitPrice(request.getLimitPrice())
                .quantity(request.getQuantity())
                .build();

        var portfolio = user.getPortfolio();

        if (portfolio == null) {
            throw ResourceNotFoundException.toException(Portfolio.class);
        }

        // validate orders:
        // - BUY - ensure user has sufficient balance
        // - SELL - ensure user has sufficient shares
        if (request.getDirection() == OrderDirection.BUY) {
            var totalPrice = request.getLimitPrice() * request.getQuantity();

            if (portfolio.getBalance() < totalPrice) {
                throw new InsufficientFundsException("User has insufficient funds.");
            }
        }
        else if (request.getDirection() == OrderDirection.SELL) {
            var positions = portfolio.getPositions()
                    .stream().filter(pos -> pos.getStock().getId() == stock.getId())
                    .mapToInt(Position::getQuantity)
                    .sum();

            if (positions < request.getQuantity()) {
                throw new InsufficientFundsException("User has insufficient shares.");
            }
        }

        // save order to Kafka
        var savedOrder = orderRepository.save(order);

        TradeEvent tradeEvent = TradeEvent.builder()
                .orderId(savedOrder.getId())
                .userId(user.getId())
                .stockId(stock.getId())
                .symbol(stock.getSymbol())
                .direction(savedOrder.getDirection())
                .type(savedOrder.getType())
                .quantity(savedOrder.getQuantity())
                .limitPrice(savedOrder.getLimitPrice())
                .build();

        kafkaTemplate.send("trade-orders", stock.getSymbol(), tradeEvent);
        log.info("Submitted trade order: {}", tradeEvent);

        return OrderResponse.builder()
                .id(savedOrder.getId())
                .symbol(stock.getSymbol())
                .quantity(savedOrder.getQuantity())
                .limitPrice(savedOrder.getLimitPrice())
                .status(savedOrder.getStatus())
                .type(savedOrder.getType())
                .direction(savedOrder.getDirection())
                .createdAt(savedOrder.getCreatedAt())
                .build();
    }
}
