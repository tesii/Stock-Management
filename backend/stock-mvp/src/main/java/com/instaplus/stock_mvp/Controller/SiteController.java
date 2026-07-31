package com.instaplus.stock_mvp.Controller;

import com.instaplus.stock_mvp.Model.Site;
import com.instaplus.stock_mvp.Service.SiteService;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/sites")
@CrossOrigin("*")
public class SiteController {


    private final SiteService siteService;


    public SiteController(SiteService siteService) {
        this.siteService = siteService;
    }


    @PostMapping
    public Site createSite(@RequestBody Site site) {

        return siteService.createSite(site);
    }


    @GetMapping
    public List<Site> getAllSites() {

        return siteService.getAllSites();
    }


    @GetMapping("/{id}")
    public Site getSiteById(@PathVariable Long id) {

        return siteService.getSiteById(id);
    }


    @PutMapping("/{id}")
    public Site updateSite(
            @PathVariable Long id,
            @RequestBody Site site
    ) {

        return siteService.updateSite(id, site);
    }


    @DeleteMapping("/{id}")
    public String deleteSite(@PathVariable Long id) {

        siteService.deleteSite(id);

        return "Site deleted successfully";
    }



}