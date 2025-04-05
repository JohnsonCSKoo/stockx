package com.johnsoncskoo.stockx.service;

import com.johnsoncskoo.stockx.dto.OrderRequest;
import com.johnsoncskoo.stockx.dto.OrderResponse;
import jakarta.servlet.http.HttpSession;

public interface TradeService {
    OrderResponse submitOrder(HttpSession session, OrderRequest request);
}
