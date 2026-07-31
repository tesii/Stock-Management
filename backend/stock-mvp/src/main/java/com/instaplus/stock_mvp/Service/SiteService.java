package com.instaplus.stock_mvp.Service;

import com.instaplus.stock_mvp.Model.Site;

import java.util.List;

public interface SiteService {

    Site createSite(Site site);

    List<Site> getAllSites();

    Site getSiteById(Long id);

    Site updateSite(Long id, Site site);

    void deleteSite(Long id);
}