package com.instaplus.stock_mvp.Service;

import com.instaplus.stock_mvp.Model.Item;
import com.instaplus.stock_mvp.Repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    private final ItemRepository repo;

    public ItemService(ItemRepository repo) {
        this.repo = repo;
    }

    public List<Item> getAll() {
        return repo.findAll();
    }

    public Item create(Item item) {
        return repo.save(item);
    }

    public Item getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
    public Item update(Long id, Item newItem) {

    Item item = repo.findById(id).orElse(null);

    if (item == null) {
        return null;
    }

    item.setName(newItem.getName());
    item.setQuantity(newItem.getQuantity());
    item.setUnit(newItem.getUnit());
    item.setUnitPrice(newItem.getUnitPrice());

    return repo.save(item);
}
public List<Item> getLowStockItems() {
    return repo.findAll()
        .stream()
        .filter(i -> i.getQuantity() <= i.getMinStockLevel())
        .toList();
}
}