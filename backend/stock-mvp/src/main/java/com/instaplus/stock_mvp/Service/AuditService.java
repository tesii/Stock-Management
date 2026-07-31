package com.instaplus.stock_mvp.Service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.instaplus.stock_mvp.Model.Audit;
import com.instaplus.stock_mvp.Repository.AuditRepository;

@Service
public class AuditService {

    private final AuditRepository repository;


    public AuditService(AuditRepository repository){
        this.repository = repository;
    }


    public void log(
        String user,
        String role,

        String action,
        String entity,
        Long id,
        String description
    ){

        Audit audit = new Audit();

        audit.setUsername(user);
            audit.setRole(role);

        audit.setAction(action);
        audit.setEntityName(entity);
        audit.setEntityId(id);
        audit.setDescription(description);
        audit.setCreatedAt(LocalDateTime.now());


        repository.save(audit);
    }
}
