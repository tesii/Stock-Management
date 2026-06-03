
package com.instaplus.stock_mvp.Service;

import com.instaplus.stock_mvp.Model.StockMovement;
import com.instaplus.stock_mvp.Model.Item;

import com.instaplus.stock_mvp.Repository.StockMovementRepository;
import com.instaplus.stock_mvp.Repository.ItemRepository;

import org.springframework.stereotype.Service;
import java.time.LocalDate;

import java.util.List;
@Service
public class StockMovementService {

    private final StockMovementRepository repo;
    private final ItemRepository itemRepo;

    public StockMovementService(StockMovementRepository repo, ItemRepository itemRepo) {
        this.repo = repo;
        this.itemRepo = itemRepo;
    }

public StockMovement saveMovement(StockMovement m) {

    if (m.getDate() == null) {
        m.setDate(LocalDate.now());
    }

    if (m.getType().equalsIgnoreCase("OUT")) {
        m.setStatus("PENDING");
    } else {
        m.setStatus("APPROVED");

        // ONLY IN updates stock immediately
        Item item = itemRepo.findById(m.getItemId()).orElse(null);

        if (item == null) {
            throw new RuntimeException("Item not found");
        }

        item.setQuantity(item.getQuantity() + m.getQuantity());
        itemRepo.save(item);
    }

    return repo.save(m);
}

public StockMovement approveMovement(Long id) {

    StockMovement m = repo.findById(id).orElse(null);

    if (m == null) return null;

    // 🚨 PREVENT DOUBLE APPROVAL
    if ("APPROVED".equalsIgnoreCase(m.getStatus())) {
        return m;
    }

    if (m.getType().equalsIgnoreCase("OUT")) {

        Item item = itemRepo.findById(m.getItemId()).orElse(null);

        if (item == null) {
            throw new RuntimeException("Item not found");
        }

        item.setQuantity(item.getQuantity() - m.getQuantity());
        itemRepo.save(item);
    }

    m.setStatus("APPROVED");

    return repo.save(m);
}
public StockMovement rejectMovement(Long id) {

    StockMovement m = repo.findById(id).orElse(null);

    if (m == null) return null;

    m.setStatus("REJECTED");

    return repo.save(m);
}

    public List<StockMovement> getAll() {
        return repo.findAll();
    }
}