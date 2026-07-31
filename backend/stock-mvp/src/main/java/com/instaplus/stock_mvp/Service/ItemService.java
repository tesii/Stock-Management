package com.instaplus.stock_mvp.Service;

import com.instaplus.stock_mvp.Model.Item;
import com.instaplus.stock_mvp.Repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    private final ItemRepository repo;
    private final AuditService auditService;

    public ItemService(ItemRepository repo, AuditService auditService) {
        this.repo = repo;
        this.auditService = auditService;
    }

    // ================= GET ALL =================
    public List<Item> getAll() {
        return repo.findAll();
    }

    // ================= CREATE =================
    public Item create(Item item) {

        Item saved = repo.save(item);

        auditService.log(
                "admin",
                  "ADMIN",
                "CREATE_ITEM",
                "Item",
                saved.getId(),
                "Created item: " + saved.getName()
        );

        return saved;
    }

    // ================= GET BY ID =================
    public Item getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    // ================= UPDATE =================
    public Item update(Long id, Item newItem) {

        Item item = repo.findById(id).orElse(null);

        if (item == null) {
            return null;
        }

        item.setName(newItem.getName());
        item.setQuantity(newItem.getQuantity());
        item.setUnit(newItem.getUnit());
        item.setUnitPrice(newItem.getUnitPrice());
        item.setMinStockLevel(newItem.getMinStockLevel());

        Item updated = repo.save(item);

        auditService.log(
                "admin",
                  "ADMIN",
                "UPDATE_ITEM",
                "Item",
                updated.getId(),
                "Updated item: " + updated.getName()
        );

        return updated;
    }

    // ================= DELETE =================
    public void delete(Long id) {

        Item item = repo.findById(id).orElse(null);

        if (item == null) {
            return;
        }

        repo.deleteById(id);

        auditService.log(
                "admin",
                  "ADMIN",
                "DELETE_ITEM",
                "Item",
                id,
                "Deleted item: " + item.getName()
        );
    }

    // ================= LOW STOCK =================
    public List<Item> getLowStockItems() {

        return repo.findAll()
                .stream()
                .filter(i -> i.getQuantity() <= i.getMinStockLevel())
                .toList();
    }
}