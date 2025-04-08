package com.johnsoncskoo.stockx.service;

import com.johnsoncskoo.stockx.dto.PortfolioResponse;
import jakarta.servlet.http.HttpSession;

public interface PortfolioService {
    PortfolioResponse getPortfolio(HttpSession httpSession);
}
