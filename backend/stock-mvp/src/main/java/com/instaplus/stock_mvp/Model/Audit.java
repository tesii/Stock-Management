package com.instaplus.stock_mvp.Model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Audit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User who performed the action
    @Column(nullable = false)
    private String username;

    // ADMIN, MANAGER, STORE_KEEPER
    private String role;

    // LOGIN, CREATE_ITEM, APPROVE_STOCK, etc.
    @Column(nullable = false)
    private String action;

    // Item, StockMovement, User, Site...
    private String entityName;

    // ID of the affected record
    private Long entityId;

    // Additional details
    @Column(length = 1000)
    private String description;

    // Date and time of the action
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}