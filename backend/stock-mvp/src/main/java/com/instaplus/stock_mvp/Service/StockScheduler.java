package com.instaplus.stock_mvp.Service;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.instaplus.stock_mvp.Model.Item;
import com.instaplus.stock_mvp.Model.StockMovement;
import com.instaplus.stock_mvp.Repository.ItemRepository;
import com.instaplus.stock_mvp.Repository.StockMovementRepository;

@Service
public class StockScheduler {

    private final ItemRepository itemRepository;
        private final StockMovementRepository stockMovementRepository;


    public StockScheduler(ItemRepository itemRepository, StockMovementRepository stockMovementRepository) {
        this.itemRepository = itemRepository;
        this.stockMovementRepository = stockMovementRepository;
    }


    @Scheduled(fixedRate = 30000)
    public void checkLowStock() {

        List<Item> items = itemRepository.findAll();

        items.forEach(item -> {

            if(item.getQuantity() <= item.getMinStockLevel()) {

                System.out.println(
                    "LOW STOCK: " + item.getName()
                );

                // save notification here
            }

        });

    }
        @Scheduled(fixedRate = 30000)
    public void monitorStockMovements() {

        List<StockMovement> movements = stockMovementRepository.findAll();

        long pending = movements.stream()
                .filter(m -> "PENDING".equalsIgnoreCase(m.getStatus()))
                .count();

        long approved = movements.stream()
                .filter(m -> "APPROVED".equalsIgnoreCase(m.getStatus()))
                .count();

        long rejected = movements.stream()
                .filter(m -> "REJECTED".equalsIgnoreCase(m.getStatus()))
                .count();

        System.out.println("======================================");
        System.out.println("Stock Movement Scheduler");
        System.out.println("Total Movements : " + movements.size());
        System.out.println("Pending         : " + pending);
        System.out.println("Approved        : " + approved);
        System.out.println("Rejected        : " + rejected);
        System.out.println("Checked at      : " + java.time.LocalDateTime.now());
        System.out.println("======================================");
    }
}