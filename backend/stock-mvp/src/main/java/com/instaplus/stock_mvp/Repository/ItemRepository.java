package com.instaplus.stock_mvp.Repository;

import com.instaplus.stock_mvp.Model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByQuantityLessThanEqual(Double minStockLevel);
}