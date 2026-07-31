package com.instaplus.stock_mvp.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.instaplus.stock_mvp.Model.Audit;
import com.instaplus.stock_mvp.Model.Item;
import com.instaplus.stock_mvp.Model.StockMovement;
import com.instaplus.stock_mvp.Repository.AuditRepository;
import com.instaplus.stock_mvp.Repository.ItemRepository;
import com.instaplus.stock_mvp.Repository.StockMovementRepository;
import com.instaplus.stock_mvp.Service.AuditService;

@RestController
@RequestMapping("/api/audits")
@CrossOrigin(origins = "*")
public class AuditController {

    private final AuditRepository auditRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ItemRepository itemRepository;
    private final AuditService auditService;

    public AuditController(
        AuditRepository auditRepository,
        StockMovementRepository stockMovementRepository,
        ItemRepository itemRepository,
        AuditService auditService
    ) {
        this.auditRepository = auditRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.itemRepository = itemRepository;
        this.auditService = auditService;
    }

    @GetMapping
    public List<Audit> getAllAudits() {
        return auditRepository.findAll();
    }
}