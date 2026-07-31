import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Site {
  id?: number;
  siteName: string;
  contactPerson: string;
  phone: string;
  address: string;
  active: boolean;
}

@Component({
  selector: 'app-site',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './site.html',
  styleUrls: ['./site.css']
})
export class SiteComponent implements OnInit {

  sites: Site[] = [];
  filteredSites: Site[] = [];
  searchText: string = '';

  private apiUrl = 'http://localhost:8081/api/sites';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSites();
  }

  // ================= LOAD SITES =================

  loadSites(): void {
    this.http.get<Site[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.sites = data;
        this.filteredSites = data;
      },
      error: (err) => {
        console.error('Failed to load sites', err);
      }
    });
  }

  // ================= SEARCH =================

  searchSites(): void {
    const search = this.searchText.toLowerCase();

    this.filteredSites = this.sites.filter(site =>
      site.siteName.toLowerCase().includes(search)
    );
  }

  // ================= DELETE =================

  deleteSite(id: number): void {

    if (!confirm('Are you sure you want to delete this site?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.loadSites();
      },
      error: (err) => {
        console.error('Failed to delete site', err);
      }
    });

  }

  // ================= UPDATE =================

  editSite(id: number): void {
    this.router.navigate(['/site-form', id]);
  }

  // ================= ADD SITE =================

  goToAddSite(): void {
    this.router.navigate(['/site-form']);
  }

}