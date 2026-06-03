import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { StockService } from './stock.service';
import { ItemService } from './item.service';

import { StockApprovalComponent } from './stock-approval';
import { DashboardComponent } from './dashboard';

import { BaseChartDirective } from 'ng2-charts';
import './chart.config';

type StockRow = {
  itemId: number;
  itemName: string;
  qin: number;
  qout: number;
  qtotal: number; // ✅ REAL DB STOCK
};

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BaseChartDirective,
    StockApprovalComponent,
    DashboardComponent
  ],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.css']
})
export class ManagerDashboard implements OnInit {

  // ================= VIEW =================
  currentView: string = 'dashboard';
  userName: string = 'Manager';

  // ================= DATA =================
  notifications: string[] = [];

  stockSummary: StockRow[] = [];
  filteredSummary: StockRow[] = [];

  // ================= CHART =================
  chartDataConfig: any = {
    labels: ['IN', 'OUT'],
    datasets: [{ data: [0, 0], backgroundColor: ['#14b8a6', '#ef4444'] }]
  };

  chartData: { name: string; value: number }[] = [];

  // ================= FILTER =================
  selectedMonth: string = '';
  months: string[] = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  // ================= PAGINATION =================
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(
    private router: Router,
    private stockService: StockService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.userName = JSON.parse(storedUser)?.username ?? 'Manager';
      } catch {
        this.userName = 'Manager';
      }
    }

    this.notifications = [
      '🧾 2 approvals pending',
      '📊 Reports ready',
      '📦 New stock movement'
    ];

    this.loadStockSummary();
  }

  // ================= VIEW =================
  setView(view: string): void {
    this.currentView = view;

    if (view === 'summary') {
      this.loadStockSummary();
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // ================= LOAD DATA =================
  loadStockSummary(): void {

    this.stockService.getMovements().subscribe(movements => {
      this.itemService.getItems().subscribe(items => {

        this.stockSummary = this.buildStockSummary(items, movements);
        this.filteredSummary = [...this.stockSummary];

        this.updateChart();
      });
    });
  }

  // ================= CORE LOGIC (FIXED) =================
  private buildStockSummary(items: any[], movements: any[]): StockRow[] {

    const itemMap = new Map<number, string>();
    const stockMap = new Map<number, number>();

    // ✅ REAL DATABASE STOCK (SOURCE OF TRUTH)
    items.forEach(i => {
      if (!i.id) return;
      itemMap.set(i.id, i.name);
      stockMap.set(i.id, Number(i.quantity ?? 0));
    });

    // movement totals (for reporting only)
    const movementMap = new Map<number, { in: number; out: number }>();

    movements.forEach(m => {
      if (!m?.itemId) return;

      const entry = movementMap.get(m.itemId) ?? { in: 0, out: 0 };
      const qty = Number(m.quantity ?? 0);

      if (m.type === 'IN') entry.in += qty;
      if (m.type === 'OUT') entry.out += qty;

      movementMap.set(m.itemId, entry);
    });

    // ================= FINAL ROWS =================
    return Array.from(stockMap.entries()).map(([id, stock]) => {

      const m = movementMap.get(id) ?? { in: 0, out: 0 };

      return {
        itemId: id,
        itemName: itemMap.get(id) ?? `Item ${id}`,
        qin: m.in,
        qout: m.out,
        qtotal: stock // ✅ REAL STOCK FROM DATABASE
      };
    });
  }

  // ================= CHART =================
  updateChart(): void {

    const totalIn = this.filteredSummary.reduce((s, i) => s + i.qin, 0);
    const totalOut = this.filteredSummary.reduce((s, i) => s + i.qout, 0);

    this.chartData = [
      { name: 'IN', value: totalIn },
      { name: 'OUT', value: totalOut }
    ];

    this.chartDataConfig = {
      labels: ['IN', 'OUT'],
      datasets: [
        {
          data: [totalIn, totalOut],
          backgroundColor: ['#14b8a6', '#ef4444']
        }
      ]
    };
  }

  // ================= FILTER =================
  filterByMonth(): void {
    this.filteredSummary = [...this.stockSummary];
    this.currentPage = 1;
    this.updateChart();
  }

  // ================= PAGINATION =================
  get paginatedSummary(): StockRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSummary.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSummary.length / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  // ================= PDF =================
  downloadPDF(): void {

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    doc.text('InstaPlus Service Ltd', 14, 20);
    doc.text('Monthly Stock Summary Report', 14, 30);
    doc.text(`Generated: ${today}`, 14, 40);
    doc.text(`By: ${this.userName}`, 14, 50);

    const data = this.filteredSummary.length
      ? this.filteredSummary
      : this.stockSummary;

    autoTable(doc, {
      startY: 65,
      head: [['Item', 'IN', 'OUT', 'Stock Left']],
      body: data.map(i => [
        i.itemName,
        i.qin,
        i.qout,
        i.qtotal
      ])
    });

    doc.save(`stock-report-${today.replaceAll('/', '-')}.pdf`);
  }
}