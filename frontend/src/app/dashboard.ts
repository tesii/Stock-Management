import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ItemService, Item } from './item.service';
import { StockService, StockMovement } from './stock.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  totalItems = 0;
  totalValue = 0;
  lowStockItems: Item[] = [];
  pendingCount = 0;

  userRole: string | null = null;
  isManager = false;
  isStoreKeeper = false;

  pendingMovements: StockMovement[] = [];

  constructor(
    private itemService: ItemService,
    private stockService: StockService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();

    const user = localStorage.getItem('user');
    if (user) {
      const u = JSON.parse(user);
      this.userRole = u.role;
      this.isManager = u.role === 'MANAGER';
      this.isStoreKeeper = u.role === 'STORE_KEEPER';
    }
  }

  loadDashboard() {

    this.itemService.getItems().subscribe(items => {

      this.totalItems = items.length;

      this.totalValue = items.reduce(
        (sum, i) => sum + (i.quantity * i.unitPrice),
        0
      );

      this.lowStockItems = items.filter(
        i => i.quantity <= (i.minStockLevel ?? 0)
      );

      this.cdr.detectChanges(); // ✅ FIX
    });

    this.stockService.getMovements().subscribe(movements => {

      this.pendingCount = movements.filter(m => m.status === 'PENDING').length;

      if (this.isManager) {
        this.pendingMovements = movements.filter(m => m.status === 'PENDING');
      }

      this.cdr.detectChanges(); // ✅ FIX
    });
  }

  approve(m: StockMovement) {
    if (!m.id) return;

    this.stockService.approveMovement(m.id).subscribe(() => {
      this.loadDashboard();
    });
  }

  reject(m: StockMovement) {
    if (!m.id) return;

    this.stockService.rejectMovement(m.id).subscribe(() => {
      this.loadDashboard();
    });
  }
}