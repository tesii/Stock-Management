import { Component, OnInit } from '@angular/core';
import { StockService, StockMovement } from './stock.service';
import { ItemService, Item } from './item.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-approval.html',
  styleUrls: ['./stock-approval.css']
})
export class StockApprovalComponent implements OnInit {

  pending: StockMovement[] = [];
  items: Item[] = [];

  // ================= PAGINATION =================
  currentPage = 1;
  pageSize = 5;

  constructor(
    private stockService: StockService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.loadItems();
    this.loadPending();
  }

  loadItems(): void {
    this.itemService.getItems().subscribe({
      next: (data) => { this.items = data; },
      error: (err) => console.error(err)
    });
  }

  loadPending(): void {
    this.stockService.getPendingOut().subscribe({
      next: (data) => {
        this.pending = data.filter(m => m.status === 'PENDING');
        this.currentPage = 1; // reset to first page whenever data reloads
      },
      error: (err) => console.error(err)
    });
  }

  // ================= LOOKUP =================
  getItemName(itemId: number): string {
    const item = this.items.find(i => i.id === itemId);
    return item ? item.name : `Item ${itemId}`;
  }

  // ================= PAGINATION HELPERS =================
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.pending.length / this.pageSize));
  }

  get paginatedPending(): StockMovement[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.pending.slice(start, start + this.pageSize);
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  approve(id: number): void {
    this.stockService.approveMovement(id).subscribe({
      next: () => {
        alert('Approved!');
        this.loadPending();
      },
      error: (err) => console.error(err)
    });
  }

  reject(id: number): void {
    this.stockService.rejectMovement(id).subscribe({
      next: () => {
        alert('Rejected!');
        this.loadPending();
      },
      error: (err) => console.error(err)
    });
  }
}