import { Component, OnInit } from '@angular/core';
import { ItemService, Item } from './item.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ItemFilterPipe } from './item-filter-pipe';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-list.html',
  styleUrls: ['./item-list.css']
})
export class ItemList implements OnInit {

  // ================= DATA =================
  items: Item[] = [];
  searchText = '';

  // ================= STATS =================
  totalItems = 0;
  totalValue = 0;
  lowStockCount = 0;

  // ================= PAGINATION =================
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(private itemService: ItemService) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadItems();
  }

  // ================= LOAD ITEMS =================
  loadItems(): void {
    this.itemService.getItems().subscribe({
      next: (data) => {
        this.items = data;
        this.calculateStats();
      },
      error: (err) => console.error(err)
    });
  }

  // ================= STATS =================
  calculateStats(): void {

    this.totalItems = this.items.length;

    this.totalValue = this.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    // ✅ FIXED: now matches getStockStatus logic exactly
    this.lowStockCount = this.items.filter(item => {
      const min = item.minStockLevel ?? 0;
      const qty = item.quantity;

      return qty <= min; // 🔴 same rule as "low" in table
    }).length;
  }

  // ================= DELETE =================
  deleteItem(id: number): void {
    this.itemService.deleteItem(id).subscribe({
      next: () => this.loadItems()
    });
  }

  // ================= STOCK STATUS =================
  getStockStatus(item: Item): 'low' | 'medium' | 'high' {
    const min = item.minStockLevel ?? 0;
    const qty = item.quantity;

    if (qty <= min) return 'low';
    if (qty <= min * 1.5) return 'medium';
    return 'high';
  }

  // ================= SEARCH FILTER =================
  get filteredItems(): Item[] {
    return this.items.filter(item =>
      item.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // ================= PAGINATION =================
  get paginatedItems(): Item[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }
}