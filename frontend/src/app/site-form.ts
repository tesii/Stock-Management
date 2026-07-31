import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface Site {
  id?: number;
  siteName: string;
  contactPerson: string;
  phone: string;
  address: string;
  active: boolean;
}

@Component({
  selector: 'app-site-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './site-form.html',
  styleUrls: ['./site.css']
})
export class SiteFormComponent implements OnInit {

  private apiUrl = 'http://localhost:8081/api/sites';

  isEdit = false;
  siteId!: number;

  site: Site = {
    siteName: '',
    contactPerson: '',
    phone: '',
    address: '',
    active: true
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEdit = true;
      this.siteId = Number(id);
      this.loadSite();
    }

  }

  loadSite(): void {

    this.http.get<Site>(`${this.apiUrl}/${this.siteId}`)
      .subscribe({

        next: (data) => {
          this.site = data;
        },

        error: (err) => {
          console.error(err);
        }

      });

  }

  saveSite(): void {

    if (this.isEdit) {

      this.http.put(`${this.apiUrl}/${this.siteId}`, this.site)
        .subscribe({

          next: () => {
            alert("Site updated successfully.");
            this.router.navigate(['/admin-dashboard']);
          },

          error: (err) => {
            console.error(err);
            alert("Failed to update site.");
          }

        });

    } else {

      this.http.post(this.apiUrl, this.site)
        .subscribe({

          next: () => {
            alert("Site created successfully.");
            this.router.navigate(['/admin-dashboard']);
          },

          error: (err) => {
            console.error(err);
            alert("Failed to create site.");
          }

        });

    }

  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }

}