package com.johnsoncskoo.stockx.controller;

import com.johnsoncskoo.stockx.dto.OrderRequest;
import com.johnsoncskoo.stockx.dto.OrderResponse;
import com.johnsoncskoo.stockx.service.TradeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin("*")
@RequiredArgsConstructor
public class OrderController {

    private final TradeService tradeService;

    @PostMapping("")
    public ResponseEntity<OrderResponse> placeOrder(
            HttpServletRequest request,
            @RequestBody @Validated final OrderRequest orderRequest
            ) {
        var token = (String) request.getAttribute("user-token");
        var orderResponse = tradeService.submitOrder(token, orderRequest);

        return ResponseEntity.ok(orderResponse);
    }
}
