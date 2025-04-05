package com.johnsoncskoo.stockx.repository;

import com.johnsoncskoo.stockx.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
}
