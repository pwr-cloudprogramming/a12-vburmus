package com.burmus.user.repository;

import com.burmus.result.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Long> {
    boolean existsByEmail(String email);
    User getByEmail(String email);
}