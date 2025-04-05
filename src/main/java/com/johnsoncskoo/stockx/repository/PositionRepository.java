package com.johnsoncskoo.stockx.repository;

import com.johnsoncskoo.stockx.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PositionRepository extends JpaRepository<Position, Integer> {
}
