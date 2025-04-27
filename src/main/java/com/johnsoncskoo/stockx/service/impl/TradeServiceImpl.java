package com.johnsoncskoo.stockx.service.impl;

import com.johnsoncskoo.stockx.dto.OrderRequest;
import com.johnsoncskoo.stockx.dto.OrderResponse;
import com.johnsoncskoo.stockx.exception.InsufficientFundsException;
import com.johnsoncskoo.stockx.exception.ResourceNotFoundException;
import com.johnsoncskoo.stockx.model.*;
import com.johnsoncskoo.stockx.repository.*;
import com.johnsoncskoo.stockx.service.TradeService;
import com.johnsoncskoo.stockx.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TradeServiceImpl implements TradeService {
    private final PortfolioRepository portfolioRepository;

    private final OrderRepository orderRepository;
    private final StockRepository stockRepository;
    private final PositionRepository positionRepository;
    private final StockPriceHistoryRepository  stockPriceHistoryRepository;

    private final UserService userService;

    @Override
    public OrderResponse submitOrder(String token, OrderRequest request) {
        var user = userService.getUser(token);
        var stock = stockRepository.findBySymbol(request.getSymbol())
                .orElseThrow(() -> ResourceNotFoundException.toException(Stock.class, request.getSymbol()));
        var stockPrice = stockPriceHistoryRepository.findLatestPrice(stock.getId());

        var portfolio = user.getPortfolio();

        if (portfolio == null) {
            throw ResourceNotFoundException.toException(Portfolio.class);
        }

        var order = Order.builder()
                .user(user)
                .stock(stock)
                .status(OrderStatus.PENDING)
                .direction(request.getDirection())
                .type(request.getType())
                .limitPrice(request.getLimitPrice())
                .quantity(request.getQuantity())
                .build();

        validateOrder(
                stock,
                portfolio,
                request.getDirection(),
                // immediately validate current stock price if order type is MARKET
                request.getType() == OrderType.MARKET ? stockPrice.doubleValue() : request.getLimitPrice(),
                request.getQuantity(),
                order);

        var savedOrder = orderRepository.save(order);

        // if order is MARKET, execute immediately
        if (request.getType() == OrderType.MARKET) {
            executeOrder(stockPrice, order, portfolio, stock);
            order.setExecutedPrice(stockPrice.doubleValue());
            order.setExecutedAt(LocalDateTime.now());
            order.setStatus(OrderStatus.COMPLETED);
            savedOrder = orderRepository.save(order);
        }

        return OrderResponse.builder()
                .id(savedOrder.getId())
                .symbol(stock.getSymbol())
                .quantity(savedOrder.getQuantity())
                .limitPrice(savedOrder.getLimitPrice())
                .status(savedOrder.getStatus())
                .type(savedOrder.getType())
                .direction(savedOrder.getDirection())
                .createdAt(savedOrder.getCreatedAt())
                .executedAt(savedOrder.getExecutedAt())
                .build();
    }

    @Override
    public void processTradeEvents() {
        var orders = orderRepository.findAllByStatus(OrderStatus.PENDING);

        for (var order : orders) {
            var stock = order.getStock();
            var stockPrice = stockPriceHistoryRepository.findLatestPrice(stock.getId());
            var user = order.getUser();

            // cancel order if user is expired
            if (user.isExpired()) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                continue;
            }

            // skip order if limit price is not yet met
            if (stockPrice.doubleValue() > order.getLimitPrice()) {
                continue;
            }

            var portfolio = order.getUser().getPortfolio();

            try {
                validateOrder(stock, portfolio, order.getDirection(), order.getLimitPrice(), order.getQuantity(), order);
            }
            catch (Exception e) {
                log.error("Order validation failed: {}", e.getMessage());
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                continue;
            }

            // execute order
            executeOrder(stockPrice, order, portfolio, stock);
            order.setExecutedPrice(stockPrice.doubleValue());
            order.setExecutedAt(LocalDateTime.now());
            order.setStatus(OrderStatus.COMPLETED);
            orderRepository.save(order);
        }
    }

    private void executeOrder(BigDecimal stockPrice, Order order, Portfolio portfolio, Stock stock) {
        var totalPrice = stockPrice.doubleValue() * order.getQuantity();
        // process BUY request
        if (order.getDirection() == OrderDirection.BUY) {
            portfolio.setBalance(portfolio.getBalance() - totalPrice);

            var position = portfolio.getPositions()
                    .stream().filter(pos -> pos.getStock().equals(stock))
                    .findFirst();

            if (position.isPresent()) {
                var pos = position.get();
                pos.setQuantity(pos.getQuantity() + order.getQuantity());
                // recalculate average price
                pos.setAverageCost(
                        (pos.getAverageCost() * pos.getQuantity() + stockPrice.doubleValue() * order.getQuantity())
                                / (pos.getQuantity() + order.getQuantity()));


                positionRepository.save(pos);
            }
            else {
                var newPos = Position.builder()
                        .quantity(order.getQuantity())
                        .averageCost(stockPrice.doubleValue())
                        .stock(stock)
                        .portfolio(portfolio)
                        .build();

                positionRepository.save(newPos);
            }
        }
        // process SELL request
        else {
            var position = portfolio.getPositions()
                    .stream().filter(pos -> pos.getStock().equals(stock))
                    .findFirst();
            if (position.isPresent()) {
                var pos = position.get();

                if (pos.getQuantity() == order.getQuantity()) {
                    positionRepository.delete(pos);
                }
                else {
                    pos.setQuantity(pos.getQuantity() - order.getQuantity());
                    positionRepository.save(pos);
                }
            }
            portfolio.setBalance(portfolio.getBalance() + totalPrice);
            portfolioRepository.save(portfolio);
        }
    }

    private void validateOrder(Stock stock, Portfolio portfolio, OrderDirection direction, double limitPrice, int quantity, Order order) {
        // validate orders:
        // - BUY - ensure user has sufficient balance
        // - SELL - ensure user has sufficient shares
        if (direction == OrderDirection.BUY) {
            var totalPrice = limitPrice * quantity;

            if (portfolio.getBalance() < totalPrice) {
                throw new InsufficientFundsException("User has insufficient funds.");
            }
        }
        else if (direction == OrderDirection.SELL) {
            var positions = portfolio.getPositions()
                    .stream().filter(pos -> pos.getStock().getId() == stock.getId())
                    .mapToInt(Position::getQuantity)
                    .sum();

            if (positions < quantity) {
                throw new InsufficientFundsException("User has insufficient shares.");
            }
        }
    }
}
