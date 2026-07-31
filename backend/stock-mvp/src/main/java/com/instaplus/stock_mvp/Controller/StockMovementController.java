package com.instaplus.stock_mvp.Controller;

import com.instaplus.stock_mvp.Model.StockMovement;
import com.instaplus.stock_mvp.Service.StockMovementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@CrossOrigin("*")
public class StockMovementController {

    private final StockMovementService service;

    public StockMovementController(StockMovementService service) {
        this.service = service;
    }

    // =========================
    // CREATE STOCK MOVEMENT
    // =========================
    @PostMapping
    public StockMovement create(
            @RequestBody StockMovement m,
            @RequestParam String username,
            @RequestParam String role
    ) {
        return service.saveMovement(m, username, role);
    }

    // =========================
    // GET ALL MOVEMENTS
    // =========================
    @GetMapping
    public List<StockMovement> getAll() {
        return service.getAll();
    }

    // =========================
    // APPROVE OUT STOCK
    // =========================
    @PutMapping("/approve/{id}")
    public StockMovement approve(
            @PathVariable Long id,
            @RequestParam String username,
            @RequestParam String role
    ) {
        return service.approveMovement(id, username, role);
    }

    // =========================
    // REJECT OUT STOCK
    // =========================
    @PutMapping("/reject/{id}")
    public StockMovement reject(
            @PathVariable Long id,
            @RequestParam String username,
            @RequestParam String role
    ) {
        return service.rejectMovement(id, username, role);
    }
}