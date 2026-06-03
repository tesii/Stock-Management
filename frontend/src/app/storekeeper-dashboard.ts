import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Item, ItemService } from './item.service';
import { StockService } from './stock.service';
import { StockMovementComponent } from './stock_movement';

type StockStatus = 'low' | 'average' | 'high';

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StockMovementComponent],
  templateUrl: './storekeeper-dashboard.html',
  styleUrls: ['./storekeeper-dashboard.css']
})
export class StoreKeeperDashboard implements OnInit {

  // ================= VIEW =================
  currentView = 'dashboard';
  userName = 'Store Keeper';

  // ================= NOTIFICATIONS =================
  notifications: string[] = [];
  showNotifications = false;

  // ================= FILTER =================
  selectedMonth = '';
  months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  // ================= STOCK =================
  stockSummary: any[] = [];

  chartData: { name: string; value: number }[] = [];

  lowStockThreshold = 10;

  // FIX: used in HTML
  lowStockItemIds: Set<number> = new Set<number>();

  // ================= DATA =================
  private allMovements: any[] = [];

  // ================= PAGINATION =================
  currentPage = 1;
  pageSize = 10;

  constructor(
    private router: Router,
    private itemService: ItemService,
    private stockService: StockService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('user');

      if (data) {
        try {
          const user = JSON.parse(data);
          this.userName = user.username ?? this.userName;
        } catch {
          this.userName = 'Store Keeper';
        }
      }
    }

    this.loadStockSummary();
  }

  // ================= VIEW =================
  setView(view: string) {
    this.currentView = view;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }

  // ================= NOTIFICATIONS =================
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;

    if (this.notifications.length === 0) {
      this.loadNotifications();
    }
  }

  get notificationCount(): number {
    return this.notifications.length;
  }

  // ================= PAGINATION =================
  get paginatedStock() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.stockSummary.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.stockSummary.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  // ================= LOAD =================
  private loadStockSummary() {

    this.stockService.getMovements().subscribe(movements => {
      this.allMovements = movements;

      this.itemService.getItems().subscribe(items => {
        this.processStock(items, movements);
      });
    });
  }

  // ================= FILTER =================
  filterByMonth() {

    const filtered = this.selectedMonth
      ? this.allMovements.filter(m => {
          const date = new Date(m.date ?? m.createdAt ?? '');
          return date.getMonth() === this.months.indexOf(this.selectedMonth);
        })
      : this.allMovements;

    this.itemService.getItems().subscribe(items => {
      this.processStock(items, filtered);
    });

    this.currentPage = 1;
  }

  // ================= CORE LOGIC =================
private processStock(items: Item[], movements: any[]) {

  const itemMap = new Map<number, string>();

  // ================= DB STOCK (SOURCE OF TRUTH) =================
  const dbStock = new Map<number, number>();

  items.forEach(i => {
    if (!i.id) return;

    itemMap.set(i.id, i.name);

    // ✔ STOCK LEFT COMES DIRECTLY FROM DATABASE
    dbStock.set(i.id, Number(i.quantity ?? 0));
  });

  // ================= MOVEMENT SUMMARY =================
  const movementMap = new Map<number, { in: number; out: number }>();

  movements.forEach(m => {
    if (!m?.itemId) return;

    const entry = movementMap.get(m.itemId) ?? { in: 0, out: 0 };
    const qty = Number(m.quantity ?? 0);

    if (m.type === 'IN') entry.in += qty;
    if (m.type === 'OUT') entry.out += qty;

    movementMap.set(m.itemId, entry);
  });

  // ================= BUILD STOCK SUMMARY =================
  this.stockSummary = Array.from(dbStock.entries()).map(([id, stockLeft]) => {

    const m = movementMap.get(id) ?? { in: 0, out: 0 };

    const min = items.find(i => i.id === id)?.minStockLevel ?? this.lowStockThreshold;

    let status: StockStatus = 'high';

    if (stockLeft <= min) {
      status = 'low';
    } else if (stockLeft <= min * 1.5) {
      status = 'average';
    }

    return {
      itemId: id,
      itemName: itemMap.get(id) ?? `Item ${id}`,

      // ================= IMPORTANT =================
      qtotal: stockLeft,   // ✔ LIVE DB STOCK

      // movement history only
      qin: m.in,
      qout: m.out,

      status
    };
  });

  // ================= LOW STOCK SET =================
  this.lowStockItemIds = new Set(
    this.stockSummary
      .filter(s => s.status === 'low')
      .map(s => s.itemId)
  );

  // ================= CHART =================
  let totalIn = 0;
  let totalOut = 0;

  movementMap.forEach(v => {
    totalIn += v.in;
    totalOut += v.out;
  });

  this.chartData = [
    { name: 'IN', value: totalIn },
    { name: 'OUT', value: totalOut }
  ];
}

  // ================= CHART =================
  maxChartValue(): number {
    return this.chartData.length
      ? Math.max(...this.chartData.map(d => d.value))
      : 1;
  }

  // ================= PDF =================
  downloadPDF() {

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    doc.text('InstaPlus Service Ltd', 14, 20);
    doc.text('Monthly Stock Report', 14, 30);
    doc.text(`Generated: ${today}`, 14, 40);
    doc.text(`By: ${this.userName}`, 14, 50);

    autoTable(doc, {
      startY: 60,
      head: [['Item', 'IN', 'OUT', 'Stock', 'Status']],
      body: this.stockSummary.map(i => [
        i.itemName,
        i.qin,
        i.qout,
        i.qtotal,
        i.status
      ])
    });

    doc.save('monthly-stock-report.pdf');
  }

  // ================= NOTIFICATIONS =================
  private loadNotifications() {

    this.stockService.getMovements().subscribe(movements => {

      const approved = movements.filter(m => m.status === 'APPROVED').length;
      const pending = movements.filter(m => m.status === 'PENDING').length;

      this.notifications = [
        approved ? `✅ ${approved} approved` : 'No approvals',
        pending ? `⏳ ${pending} pending` : '',
        '📊 Stock updated'
      ].filter(Boolean);
    });
  }
}