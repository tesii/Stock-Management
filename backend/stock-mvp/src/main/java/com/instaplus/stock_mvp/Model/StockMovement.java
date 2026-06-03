package com.instaplus.stock_mvp.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "stock_movement")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long itemId;

    private String type; // IN or OUT

    private Double quantity;

    private String site; // optional for OUT

    private LocalDate date;

    private String note;
        private String status; // PENDING, APPROVED, REJECTED

}