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

@ManyToOne
@JoinColumn(name = "site_id")
private Site site;

    private LocalDate date;
@PrePersist
public void prePersist(){

    if(date == null){

        date = LocalDate.now();

    }

    if(status == null){

        status = "PENDING";

    }

}
    private String note;
        private String status; // PENDING, APPROVED, REJECTED

}