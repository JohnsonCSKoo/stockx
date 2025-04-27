package com.johnsoncskoo.stockx.service;

import com.johnsoncskoo.stockx.dto.OrderRequest;
import com.johnsoncskoo.stockx.dto.OrderResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface TradeService {
    OrderResponse submitOrder(String token, OrderRequest request);
    void processTradeEvents();
    Page<OrderResponse> getOrders(String token, PageRequest pageable, String filter);
}
