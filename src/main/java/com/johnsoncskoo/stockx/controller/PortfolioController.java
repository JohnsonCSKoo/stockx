package com.johnsoncskoo.stockx.controller;

import com.johnsoncskoo.stockx.dto.PortfolioResponse;
import com.johnsoncskoo.stockx.service.PortfolioService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/portfolios")
@CrossOrigin("*")
@RequiredArgsConstructor
public class PortfolioController {

    private final ObjectFactory<HttpSession> httpSessionFactory;
    private final PortfolioService portfolioService;

    @GetMapping("{id}")
    public ResponseEntity<PortfolioResponse> getUserPortfolio(
            @PathVariable("id") final Long id
    ) {
        var httpSession = httpSessionFactory.getObject();
        var portfolio = portfolioService.getPortfolio(httpSession);

        return ResponseEntity.ok(portfolio);
    }
}
