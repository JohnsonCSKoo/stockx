package com.johnsoncskoo.stockx.service.impl;

import com.johnsoncskoo.stockx.dto.PortfolioResponse;
import com.johnsoncskoo.stockx.dto.PositionDto;
import com.johnsoncskoo.stockx.exception.ResourceNotFoundException;
import com.johnsoncskoo.stockx.exception.SessionNotFoundException;
import com.johnsoncskoo.stockx.model.Portfolio;
import com.johnsoncskoo.stockx.model.Position;
import com.johnsoncskoo.stockx.repository.PortfolioRepository;
import com.johnsoncskoo.stockx.service.PortfolioService;
import com.johnsoncskoo.stockx.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final UserService userService;

    private static PositionDto mapPositionToDto(Position position) {
        return PositionDto.builder()
                .positionId(position.getId())
                .stockId(position.getStock().getId())
                .stockName(position.getStock().getName())
                .stockSymbol(position.getStock().getSymbol())
                .quantity(position.getQuantity())
                .averagePrice(position.getAverageCost())
                .totalValue(position.getAverageCost() * position.getQuantity())
                .build();
    }

    @Override
    public PortfolioResponse getPortfolio(HttpSession httpSession) {
        if (!userService.isUserLoggedIn(httpSession)) {
            throw SessionNotFoundException.toException(httpSession.getId());
        }

        var user = userService.getUser(httpSession);
        var portfolio = portfolioRepository.findByUser(user);

        if (portfolio == null) {
            throw ResourceNotFoundException.toException(Portfolio.class);
        }

        var positions = portfolio.getPositions().stream()
                        .map(PortfolioServiceImpl::mapPositionToDto)
                        .toList();

        return PortfolioResponse.builder()
                .id(portfolio.getId())
                .balance(portfolio.getBalance())
                .positions(positions)
                .build();
    }
}
