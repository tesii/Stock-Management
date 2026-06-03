import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { UserList } from './user-list';
import { UserForm } from './user-form';
import { DashboardComponent } from './dashboard';
import { ItemList } from './item-list';
import { StockMovementComponent } from './stock_movement';

import { ItemService } from './item.service';
import { StockService } from './stock.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserList,
    UserForm,
    DashboardComponent,
    ItemList,
    StockMovementComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {

  // ================= VIEW =================
  currentView: string = 'dashboard';

  // ================= USER =================
  userName: string = 'Admin';

  // ================= NOTIFICATIONS =================
  notifications: string[] = [];
  showNotifications: boolean = false;

  // ================= METRICS =================
  totalItems: number = 0;
  totalUsers: number = 0;

  // NOTE: admin only sees movement stats, NOT approvals
  totalStockIn: number = 0;
  totalStockOut: number = 0;

  constructor(
    private router: Router,
    private itemService: ItemService,
    private stockService: StockService
  ) {}

ngOnInit(): void {

  const user = localStorage.getItem('user');

  if (user) {
    const parsed = JSON.parse(user);
    this.userName = parsed?.username || 'Admin';
  }

  setTimeout(() => {
    this.loadMetrics();
    this.loadNotifications();
  });
}
  // ================= VIEW SWITCH =================
  setView(view: string): void {
    this.currentView = view;
  }

  // ================= LOGOUT =================
  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // ================= NOTIFICATION TOGGLE =================
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  // ================= METRICS =================
  private loadMetrics(): void {

    this.itemService.getItems().subscribe(items => {
      this.totalItems = items.length;
    });

    this.stockService.getMovements().subscribe(movements => {

      // 🔥 ADMIN VIEW ONLY: IN & OUT
      this.totalStockIn = movements
        .filter(m => m.type === 'IN')
        .reduce((sum, m) => sum + (m.quantity || 0), 0);

      this.totalStockOut = movements
        .filter(m => m.type === 'OUT')
        .reduce((sum, m) => sum + (m.quantity || 0), 0);
    });

    fetch('http://localhost:8081/api/users')
      .then(res => res.json())
      .then(users => {
        this.totalUsers = Array.isArray(users) ? users.length : 0;
      })
      .catch(() => this.totalUsers = 0);
  }

  // ================= NOTIFICATIONS =================
  private loadNotifications(): void {

    const alerts: string[] = [];

    this.itemService.getItems().subscribe(items => {

      const lowStock = items.filter(
        i => i.quantity <= (i.minStockLevel ?? 0)
      ).length;

      if (lowStock > 0) {
        alerts.push(`⚠️ ${lowStock} products are low in stock.`);
      }

      this.stockService.getMovements().subscribe(movements => {

        const pending = movements.filter(m => m.status === 'PENDING').length;

        // ❌ NO approval action mention (admin cannot approve)
        if (pending > 0) {
          alerts.push(`⏳ ${pending} requests waiting for manager approval.`);
        }

        alerts.push('📊 Admin has read-only access to stock movements.');
        alerts.push('👥 User management and roles are fully controlled here.');

        this.notifications = alerts;
      });
    });
  }
}