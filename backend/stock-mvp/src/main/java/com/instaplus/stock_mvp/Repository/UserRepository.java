package com.instaplus.stock_mvp.Repository;

import com.instaplus.stock_mvp.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameAndPassword(String username, String password);
    java.util.List<User> findAllByUsername(String username);
    Optional<User> findByUsername(String username);
}