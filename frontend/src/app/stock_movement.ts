import { Component, OnInit } from '@angular/core';
import { StockService, StockMovement } from './stock.service';
import { ItemService, Item } from './item.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Site {
  id: number;
  siteName: string;
  contactPerson: string;
  phone: string;
  address: string;
  active: boolean;
}

@Component({
  selector: 'app-stock-movement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './stock_movement.html',
  styleUrls: ['./stock_movement.css']
})
export class StockMovementComponent implements OnInit {

  items: Item[] = [];
  sites: Site[] = [];

  form: StockMovement = {
    itemId: 0,
    type: 'IN',
    quantity: 0,
    site: null,
    date: new Date().toISOString().split('T')[0],
    note: '',
    status: 'PENDING'
  };

  private siteUrl = 'http://localhost:8081/api/sites';

  constructor(
    private stockService: StockService,
    private itemService: ItemService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadItems();
    this.loadSites();
  }


  get filteredItems(): Item[] {
    if (this.form.type === 'OUT' && this.form.quantity > 0) {
      return this.items.filter(item => item.quantity >= this.form.quantity);
    }
    return this.items;
  }

  // Clears the selected item if it's no longer valid for the current
  // type/quantity combination (e.g. quantity increased past its stock).
  onTypeOrQuantityChange(): void {
    const stillValid = this.filteredItems.some(i => i.id === this.form.itemId);
    if (!stillValid) {
      this.form.itemId = 0;
    }
  }

  // ================= LOAD ITEMS =================
  loadItems(): void {
    this.itemService.getItems()
      .subscribe({
        next: (data) => {
          this.items = data;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  // ================= LOAD SITES =================
  loadSites(): void {
    this.http.get<Site[]>(this.siteUrl)
      .subscribe({
        next: (data) => {
          this.sites = data;
        },
        error: (err) => {
          console.error("Failed loading sites", err);
        }
      });
  }

  // ================= SAVE =================
  submit(): void {
    this.stockService.createMovement(this.form)
      .subscribe({
        next: () => {
          alert('Stock movement saved!');
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  resetForm() {
    this.form = {
      itemId: 0,
      type: 'IN',
      quantity: 0,
      site: null,
      date: new Date().toISOString().split('T')[0],
      note: '',
      status: 'PENDING'
    };
  }
}