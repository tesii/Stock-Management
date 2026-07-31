package com.instaplus.stock_mvp.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "site")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Site {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String siteName;

    private String contactPerson;

    private String phone;

    private String address;

    private Boolean active = true;
}