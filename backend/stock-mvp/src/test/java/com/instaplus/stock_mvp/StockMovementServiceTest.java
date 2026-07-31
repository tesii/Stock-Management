package com.instaplus.stock_mvp;

import com.instaplus.stock_mvp.Model.Item;
import com.instaplus.stock_mvp.Model.StockMovement;
import com.instaplus.stock_mvp.Repository.ItemRepository;
import com.instaplus.stock_mvp.Repository.StockMovementRepository;
import com.instaplus.stock_mvp.Service.StockMovementService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StockMovementServiceTest {

    @Mock
    private StockMovementRepository repo;

    @Mock
    private ItemRepository itemRepo;

    @InjectMocks
    private StockMovementService service;

    public StockMovementServiceTest() {
        MockitoAnnotations.openMocks(this);
    }

    // 1. SAVE IN movement (updates stock immediately)
    @Test
    void testSaveInMovement() {

        Item item = new Item();
        item.setId(1L);
        item.setQuantity(10.0);

        StockMovement m = new StockMovement();
        m.setItemId(1L);
        m.setType("IN");
        m.setQuantity(5.0);

        when(itemRepo.findById(1L)).thenReturn(Optional.of(item));
        when(itemRepo.save(any(Item.class))).thenReturn(item);
        when(repo.save(any(StockMovement.class))).thenReturn(m);

        StockMovement result = service.saveMovement(m);

        assertEquals("APPROVED", result.getStatus());
        assertNotNull(result.getDate());

        System.out.println("✅ SAVE IN MOVEMENT TEST PASSED");
        System.out.println("✔ New Quantity: " + item.getQuantity());
    }

    // 2. SAVE OUT movement (should be PENDING)
    @Test
    void testSaveOutMovement() {

        StockMovement m = new StockMovement();
        m.setItemId(1L);
        m.setType("OUT");
        m.setQuantity(3.0);

        when(repo.save(any(StockMovement.class))).thenReturn(m);

        StockMovement result = service.saveMovement(m);

        assertEquals("PENDING", result.getStatus());

        System.out.println("✅ SAVE OUT MOVEMENT TEST PASSED");
        System.out.println("✔ Status: " + result.getStatus());
    }

    // 3. APPROVE OUT movement (reduces stock)
    @Test
    void testApproveOutMovement() {

        Item item = new Item();
        item.setId(1L);
        item.setQuantity(10.0);

        StockMovement m = new StockMovement();
        m.setId(1L);
        m.setItemId(1L);
        m.setType("OUT");
        m.setQuantity(4.0);
        m.setStatus("PENDING");

        when(repo.findById(1L)).thenReturn(Optional.of(m));
        when(itemRepo.findById(1L)).thenReturn(Optional.of(item));
        when(itemRepo.save(any(Item.class))).thenReturn(item);
        when(repo.save(any(StockMovement.class))).thenReturn(m);

        StockMovement result = service.approveMovement(1L);

        assertEquals("APPROVED", result.getStatus());

        System.out.println("✅ APPROVE OUT MOVEMENT TEST PASSED");
        System.out.println("✔ Remaining Stock: " + item.getQuantity());
    }

    // 4. REJECT movement
    @Test
    void testRejectMovement() {

        StockMovement m = new StockMovement();
        m.setId(1L);
        m.setStatus("PENDING");

        when(repo.findById(1L)).thenReturn(Optional.of(m));
        when(repo.save(any(StockMovement.class))).thenReturn(m);

        StockMovement result = service.rejectMovement(1L);

        assertEquals("REJECTED", result.getStatus());

        System.out.println("✅ REJECT MOVEMENT TEST PASSED");
        System.out.println("✔ Status: " + result.getStatus());
    }

    // 5. GET ALL
    @Test
    void testGetAllMovements() {

        when(repo.findAll()).thenReturn(java.util.List.of());

        var result = service.getAll();

        assertNotNull(result);

        System.out.println("✅ GET ALL MOVEMENTS TEST PASSED");
        System.out.println("✔ Total movements: " + result.size());
    }
}