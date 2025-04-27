package com.johnsoncskoo.stockx.repository;

import com.johnsoncskoo.stockx.model.Order;
import com.johnsoncskoo.stockx.model.OrderStatus;
import com.johnsoncskoo.stockx.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    List<Order> findAllByStatus(OrderStatus status);
    Page<Order> findAllByUser(User user, Pageable pageable);
}
