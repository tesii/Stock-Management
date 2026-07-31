package com.instaplus.stock_mvp.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.instaplus.stock_mvp.Model.Audit;

public interface AuditRepository 
extends JpaRepository<Audit,Long>{

}
