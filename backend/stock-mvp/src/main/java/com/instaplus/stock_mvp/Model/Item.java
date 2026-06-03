package com.instaplus.stock_mvp.Model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Double quantity;

    private String unit;

    private Double unitPrice;
    private Double minStockLevel;
}