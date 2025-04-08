package com.johnsoncskoo.stockx.repository;

import com.johnsoncskoo.stockx.model.User;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    User findBySessionId(String sessionId);

    boolean existsByUsernameIgnoreCase(@NotEmpty String username);

    boolean existsBySessionId(String sessionId);
}
