package com.johnsoncskoo.stockx.specification;

import com.johnsoncskoo.stockx.model.Order;
import com.johnsoncskoo.stockx.model.OrderDirection;
import com.johnsoncskoo.stockx.model.OrderStatus;
import com.johnsoncskoo.stockx.model.OrderType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

public class OrderSpecification {
    public static Specification<Order> matchesFilter(String filter) {
        return (root, query, cb) -> {
            String pattern = "%" + filter.toLowerCase() + "%";
            var joinStock = root.join("stock");

            // Try parsing as double for price comparison
            Double numericFilter = null;
            try {
                numericFilter = Double.parseDouble(filter);
            } catch (NumberFormatException ignored) {}

            // Try parsing as order status
            OrderStatus statusFilter = null;
            try {
                statusFilter = OrderStatus.valueOf(filter.toUpperCase());
            } catch (IllegalArgumentException ignored) {}

            // Try parsing as order type
            OrderType typeFilter = null;
            try {
                typeFilter = OrderType.valueOf(filter.toUpperCase());
            } catch (IllegalArgumentException ignored) {}

            // Try parsing as order direction
            OrderDirection directionFilter = null;
            try {
                directionFilter = OrderDirection.valueOf(filter.toUpperCase());
            } catch (IllegalArgumentException ignored) {}

            // Try parsing as created date
            LocalDateTime createdDateFilter = null;
            try {
                createdDateFilter = LocalDateTime.parse(filter);
            } catch (DateTimeParseException ignored) {}

            return cb.or(
                    cb.like(cb.lower(joinStock.get("symbol")), pattern),
                    numericFilter != null ? cb.or(
                            cb.equal(root.get("quantity"), numericFilter.intValue()),
                            cb.equal(root.get("limitPrice"), numericFilter),
                            cb.equal(root.get("executedPrice"), numericFilter)
                    ) : cb.conjunction(),
                    statusFilter != null ? cb.equal(root.get("status"), statusFilter) : cb.conjunction(),
                    typeFilter != null ? cb.equal(root.get("type"), typeFilter) : cb.conjunction(),
                    directionFilter != null ? cb.equal(root.get("direction"), directionFilter) : cb.conjunction(),
                    createdDateFilter != null ? cb.equal(root.get("createdAt"), createdDateFilter) : cb.conjunction()
            );
        };
    }
}
