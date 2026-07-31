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
    private final AuditService auditService;


    public StockMovementService(
            StockMovementRepository repo,
            ItemRepository itemRepo,
            AuditService auditService
    ) {
        this.repo = repo;
        this.itemRepo = itemRepo;
        this.auditService = auditService;
    }



    // ================= CREATE MOVEMENT =================

    public StockMovement saveMovement(StockMovement m, String username, String role) {


        if (m.getDate() == null) {
            m.setDate(LocalDate.now());
        }


        if (m.getType().equalsIgnoreCase("OUT")) {

            m.setStatus("PENDING");


        } else {

            m.setStatus("APPROVED");


            // IN updates stock immediately
            Item item = itemRepo.findById(m.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));


            item.setQuantity(item.getQuantity() + m.getQuantity());

            itemRepo.save(item);

        }


        StockMovement saved = repo.save(m);



        auditService.log(
                username,
                role,
                "CREATE_STOCK_MOVEMENT",
                "StockMovement",
                saved.getId(),
                "Created " + saved.getType() +
                        " movement of quantity " +
                        saved.getQuantity() +
                        " for item ID " +
                        saved.getItemId()
        );


        return saved;
    }





    // ================= APPROVE =================

    public StockMovement approveMovement(Long id, String username, String role) {


        StockMovement m = repo.findById(id)
                .orElse(null);


        if (m == null) {
            return null;
        }



        // Prevent double approval
        if ("APPROVED".equalsIgnoreCase(m.getStatus())) {
            return m;
        }



        if (m.getType().equalsIgnoreCase("OUT")) {


            Item item = itemRepo.findById(m.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));



            item.setQuantity(
                    item.getQuantity() - m.getQuantity()
            );


            itemRepo.save(item);

        }



        m.setStatus("APPROVED");


        StockMovement approved = repo.save(m);



        auditService.log(
                username,
                role,
                "APPROVE_STOCK_MOVEMENT",
                "StockMovement",
                approved.getId(),
                "Approved " +
                        approved.getType() +
                        " movement of quantity " +
                        approved.getQuantity()
        );



        return approved;
    }





    // ================= REJECT =================

    public StockMovement rejectMovement(Long id, String username, String role) {


        StockMovement m = repo.findById(id)
                .orElse(null);



        if (m == null) {
            return null;
        }



        m.setStatus("REJECTED");


        StockMovement rejected = repo.save(m);



        auditService.log(
                username,
                role,
                "REJECT_STOCK_MOVEMENT",
                "StockMovement",
                rejected.getId(),
                "Rejected stock movement of quantity "
                        + rejected.getQuantity()
        );



        return rejected;
    }





    // ================= GET ALL =================

    public List<StockMovement> getAll() {

        return repo.findAll();

    }

}