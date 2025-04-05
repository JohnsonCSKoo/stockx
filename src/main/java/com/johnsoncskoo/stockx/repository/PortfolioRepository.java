package com.johnsoncskoo.stockx.repository;

import com.johnsoncskoo.stockx.model.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Integer> {
}
