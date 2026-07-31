package com.instaplus.stock_mvp;

import com.instaplus.stock_mvp.Model.Item;
import com.instaplus.stock_mvp.Repository.ItemRepository;
import com.instaplus.stock_mvp.Service.ItemService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ItemServiceTest {

    @Mock
    private ItemRepository repo;

    @InjectMocks
    private ItemService service;

    public ItemServiceTest() {
        MockitoAnnotations.openMocks(this);
    }

    // 1. CREATE
    @Test
    void testCreateItem() {

        Item item = new Item();
        item.setName("Laptop");
        item.setQuantity(10.0);

        when(repo.save(any(Item.class))).thenReturn(item);

        Item result = service.create(item);

        assertNotNull(result);
        assertEquals("Laptop", result.getName());
        assertEquals(10.0, result.getQuantity());

        System.out.println("✅ CREATE TEST PASSED SUCCESSFULLY");
        System.out.println("✔ Item created: " + result.getName());
    }

    // 2. GET ALL
    @Test
    void testGetAllItems() {

        Item item1 = new Item();
        item1.setName("Laptop");
        item1.setQuantity(10.0);

        Item item2 = new Item();
        item2.setName("Mouse");
        item2.setQuantity(5.0);

        when(repo.findAll()).thenReturn(List.of(item1, item2));

        List<Item> result = service.getAll();

        assertEquals(2, result.size());

        System.out.println("✅ GET ALL TEST PASSED SUCCESSFULLY");

        result.forEach(i ->
            System.out.println("✔ " + i.getName() + " | Qty: " + i.getQuantity())
        );
    }

    // 3. GET BY ID
    @Test
    void testGetById() {

        Item item = new Item();
        item.setName("Laptop");

        when(repo.findById(1L)).thenReturn(Optional.of(item));

        Item result = service.getById(1L);

        assertNotNull(result);
        assertEquals("Laptop", result.getName());

        System.out.println("✅ GET BY ID TEST PASSED SUCCESSFULLY");
    }

    // 4. DELETE
    @Test
    void testDeleteItem() {

        doNothing().when(repo).deleteById(1L);

        service.delete(1L);

        verify(repo, times(1)).deleteById(1L);

        System.out.println("✅ DELETE TEST PASSED SUCCESSFULLY");
    }

    // 5. UPDATE
    @Test
    void testUpdateItem() {

        Item existing = new Item();
        existing.setName("Old Name");
        existing.setQuantity(5.0);
        existing.setUnit("PCS");
        existing.setUnitPrice(1000.0);

        Item updated = new Item();
        updated.setName("New Name");
        updated.setQuantity(20.0);
        updated.setUnit("BOX");
        updated.setUnitPrice(3000.0);

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(any(Item.class))).thenReturn(existing);

        Item result = service.update(1L, updated);

        assertEquals("New Name", result.getName());
        assertEquals(20.0, result.getQuantity());

        System.out.println("✅ UPDATE TEST PASSED SUCCESSFULLY");
    }

    // 6. LOW STOCK
    @Test
    void testGetLowStockItems() {

        Item lowStock = new Item();
        lowStock.setName("Air Freshener");
        lowStock.setQuantity(5.0);
        lowStock.setMinStockLevel(10.0);

        Item normalStock = new Item();
        normalStock.setName("Laptop");
        normalStock.setQuantity(50.0);
        normalStock.setMinStockLevel(10.0);

        when(repo.findAll()).thenReturn(List.of(lowStock, normalStock));

        List<Item> result = service.getLowStockItems();

        assertEquals(1, result.size());

        System.out.println("✅ LOW STOCK TEST PASSED SUCCESSFULLY");

        result.forEach(i ->
            System.out.println("✔ " + i.getName() + " | Qty: " + i.getQuantity())
        );
    }
}