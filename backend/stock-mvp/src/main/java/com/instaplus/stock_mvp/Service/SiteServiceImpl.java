package com.instaplus.stock_mvp.Service;

import com.instaplus.stock_mvp.Model.Site;
import com.instaplus.stock_mvp.Repository.SiteRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SiteServiceImpl implements SiteService {


    private final SiteRepository siteRepository;
    private final AuditService auditService;


    public SiteServiceImpl(
            SiteRepository siteRepository,
            AuditService auditService
    ) {
        this.siteRepository = siteRepository;
        this.auditService = auditService;
    }


    // ================= CREATE SITE =================
    @Override
    public Site createSite(Site site) {

        Site saved = siteRepository.save(site);


        auditService.log(
                "admin",
                "ADMIN",
                "CREATE_SITE",
                "Site",
                saved.getId(),
                "Created site: " + saved.getSiteName()
        );


        return saved;
    }



    // ================= GET ALL =================
    @Override
    public List<Site> getAllSites() {

        return siteRepository.findAll();
    }




    // ================= GET BY ID =================
    @Override
    public Site getSiteById(Long id) {

        return siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found"));
    }




    // ================= UPDATE SITE =================
    @Override
    public Site updateSite(Long id, Site site) {


        Site existing = getSiteById(id);


        existing.setSiteName(site.getSiteName());
        existing.setContactPerson(site.getContactPerson());
        existing.setPhone(site.getPhone());
        existing.setAddress(site.getAddress());
        existing.setActive(site.getActive());


        Site updated = siteRepository.save(existing);



        auditService.log(
                "admin",
                "ADMIN",
                "UPDATE_SITE",
                "Site",
                updated.getId(),
                "Updated site: " + updated.getSiteName()
        );


        return updated;
    }





    // ================= DELETE SITE =================
    @Override
    public void deleteSite(Long id) {


        Site site = getSiteById(id);


        siteRepository.deleteById(id);



        auditService.log(
                "admin",
                "ADMIN",
                "DELETE_SITE",
                "Site",
                id,
                "Deleted site: " + site.getSiteName()
        );

    }

}