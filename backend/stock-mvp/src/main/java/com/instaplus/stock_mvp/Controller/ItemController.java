package com.instaplus.stock_mvp.Controller;
import com.instaplus.stock_mvp.Model.Item;
import com.instaplus.stock_mvp.Service.ItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/items")
@CrossOrigin("*")
public class ItemController {

    private final ItemService service;

    public ItemController(ItemService service) {
        this.service = service;
    }

    @GetMapping
    public List<Item> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Item create(@RequestBody Item item) {
        return service.create(item);
    }

    @GetMapping("/{id}")
    public Item getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Item update(@PathVariable Long id, @RequestBody Item item) {
        return service.update(id, item);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Item deleted successfully";
    }
    @GetMapping("/low-stock")
public List<Item> lowStock() {
    return service.getLowStockItems();
}
}