package com.instaplus.stock_mvp.Repository;

import com.instaplus.stock_mvp.Model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
}