import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuditList } from './audit-list';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { StockService, StockMovement } from './stock.service';
import { ItemService } from './item.service';

import { StockApprovalComponent } from './stock-approval';
import { DashboardComponent } from './dashboard';
import { ItemList } from './item-list';
import { BaseChartDirective } from 'ng2-charts';
import './chart.config';

type StockStatus = 'low' | 'average' | 'high';

type StockRow = {
  itemId: number;
  itemName: string;
  qin: number;
  qout: number;
  qtotal: number;   // ✅ REAL DB STOCK
  siteName: string;
  date: string;
  status: StockStatus;       // computed stock-level indicator (low/average/high)
  movementStatus: string;    // actual status from the stock_movement table (APPROVED/PENDING/REJECTED)
};

// per-site consumption summary
type SiteOutRow = {
  siteName: string;
  totalOut: number;
  topItemName: string;
  topItemOut: number;
};

interface Site {
  id: number;
  siteName: string;
}

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BaseChartDirective,
    StockApprovalComponent,
    DashboardComponent,
    ItemList,
     AuditList

  ],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.css']
})
export class ManagerDashboard implements OnInit {

  // ================= VIEW =================
  currentView: string = 'dashboard';
  userName: string = 'Manager';

  // ================= SUMMARY TABS =================
  summaryTab: 'overview' | 'detailed' = 'overview';

  setSummaryTab(tab: 'overview' | 'detailed') {
    this.summaryTab = tab;
  }
sidebarCollapsed = false;

toggleSidebar(): void {
  this.sidebarCollapsed = !this.sidebarCollapsed;
}
  // ================= DATA =================
  notifications: string[] = [];

  // full item summary for the currently selected month (unfiltered by site/date)
  private monthFilteredSummary: StockRow[] = [];
  stockSummary: StockRow[] = [];

  // sites for the site filter dropdown
  sites: Site[] = [];

  // site + date filters (mirrors storekeeper summary)
  selectedSite: string = '';
  selectedDate: string = ''; // yyyy-MM-dd from <input type="date">

  // ================= OVERVIEW TAB: SEARCH + PAGINATION =================
  overviewSearchTerm: string = '';
  overviewCurrentPage: number = 1;
  overviewPageSize: number = 10;

  // ================= STOCK STATUS =================
  lowStockThreshold = 10; // fallback when item has no minStockLevel

  // site performance data
  siteOutSummary: SiteOutRow[] = [];
  topConsumingSite: SiteOutRow | null = null;

  // ================= CHART =================
  chartDataConfig: any = {
    labels: ['IN', 'OUT'],
    datasets: [{ data: [0, 0], backgroundColor: ['#1b93c9', '#ef4444'] }]
  };

  chartData: { name: string; value: number }[] = [];

  // ================= FILTER =================
  selectedMonth: string = '';
  months: string[] = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  // ================= PAGINATION (item summary table) =================
  currentPage: number = 1;
  pageSize: number = 10;

  // separate pagination for site performance table
  siteCurrentPage: number = 1;
  sitePageSize: number = 10;

  // ================= LOGO (for PDF) =================
  private logoBase64: string | null = null;

  constructor(
    private router: Router,
    private stockService: StockService,
    private itemService: ItemService,
    private http: HttpClient
  ) {}

  // ================= SITES (for filter dropdown) =================
  loadSites(): void {
    this.http
      .get<Site[]>('http://localhost:8081/api/sites')
      .subscribe({
        next: (data) => {
          this.sites = data;
        },
        error: (err) => {
          console.error('Failed to load sites', err);
        }
      });
  }

  // ================= VIEW =================
  setView(view: string): void {
    this.currentView = view;
    localStorage.setItem('managerView', view); // persist

    if (view === 'summary' || view === 'sitePerformance') {
      this.loadStockSummary();
    }
  }

  ngOnInit(): void {
    // restore last view on refresh
    this.currentView = localStorage.getItem('managerView') ?? 'dashboard';

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

    this.loadSites();
    this.loadStockSummary();
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // ================= LOAD DATA =================
  loadStockSummary(): void {

    this.stockService.getMovements().subscribe(movements => {
      this.itemService.getItems().subscribe(items => {

        this.monthFilteredSummary = this.buildStockSummary(items, movements);
        this.stockSummary = this.monthFilteredSummary;
        this.currentPage = 1;
        this.overviewCurrentPage = 1;

        // site performance data from the same movements
        this.siteOutSummary = this.buildSiteOutSummary(items, movements);
        this.topConsumingSite = this.siteOutSummary.length ? this.siteOutSummary[0] : null;
        this.siteCurrentPage = 1;

        this.updateChart();
      });
    });
  }

  // ================= CORE LOGIC (ITEM SUMMARY) =================
  private buildStockSummary(items: any[], movements: any[]): StockRow[] {

    const itemMap = new Map<number, string>();
    const stockMap = new Map<number, number>();

    // REAL DATABASE STOCK (SOURCE OF TRUTH)
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

      // pull site + date from the matching movement, same approach as storekeeper
      const movement = movements.find(mv => mv.itemId === id);
      const siteMovement = movements.find(mv => mv.itemId === id && mv.site);

      // same status logic as storekeeper dashboard
      const min = items.find(i => i.id === id)?.minStockLevel ?? this.lowStockThreshold;

      let status: StockStatus = 'high';

      if (stock <= min) {
        status = 'low';
      } else if (stock <= min * 1.5) {
        status = 'average';
      }

      return {
        itemId: id,
        itemName: itemMap.get(id) ?? `Item ${id}`,
        qin: m.in,
        qout: m.out,
        qtotal: stock, // REAL STOCK FROM DATABASE
        siteName: siteMovement?.site?.siteName ?? 'N/A',
        date: movement?.date ?? '',
        status,
        // actual status straight from the stock_movement table
        // (APPROVED / PENDING / REJECTED), same as storekeeper dashboard
        movementStatus: movement?.status ?? 'N/A'
      };
    });
  }

  // ================= SITE PERFORMANCE LOGIC =================
  private buildSiteOutSummary(items: any[], movements: StockMovement[]): SiteOutRow[] {

    const itemNameMap = new Map<number, string>();
    items.forEach(i => {
      if (i.id) itemNameMap.set(i.id, i.name);
    });

    // siteName -> { totalOut, itemOutMap<itemName, qty> }
    const siteMap = new Map<string, { totalOut: number; itemOutMap: Map<string, number> }>();

    movements.forEach(m => {
      if (m.type !== 'OUT') return;

      const siteName = m.site?.siteName || 'Unassigned Site';
      const itemName = itemNameMap.get(m.itemId) ?? `Item ${m.itemId}`;
      const qty = Number(m.quantity ?? 0);

      const entry = siteMap.get(siteName) ?? { totalOut: 0, itemOutMap: new Map<string, number>() };
      entry.totalOut += qty;
      entry.itemOutMap.set(itemName, (entry.itemOutMap.get(itemName) ?? 0) + qty);

      siteMap.set(siteName, entry);
    });

    const rows: SiteOutRow[] = [];

    siteMap.forEach((entry, siteName) => {
      let topItemName = '—';
      let topItemOut = 0;

      entry.itemOutMap.forEach((qty, itemName) => {
        if (qty > topItemOut) {
          topItemOut = qty;
          topItemName = itemName;
        }
      });

      rows.push({
        siteName,
        totalOut: entry.totalOut,
        topItemName,
        topItemOut
      });
    });

    // highest-consuming site first
    return rows.sort((a, b) => b.totalOut - a.totalOut);
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
          backgroundColor: ['#1b93c9', '#ef4444']
        }
      ]
    };
  }

  // ================= FILTER =================
  filterByMonth(): void {
    this.monthFilteredSummary = [...this.stockSummary];
    this.currentPage = 1;
    this.updateChart();
  }

  // site + date filter handlers (mirrors storekeeper)
  onSiteChange(): void {
    this.currentPage = 1;
    this.updateChart();
  }

  onDateChange(): void {
    this.currentPage = 1;
    this.updateChart();
  }

  clearDateFilter(): void {
    this.selectedDate = '';
    this.currentPage = 1;
    this.updateChart();
  }

  clearAllFilters(): void {
    this.selectedSite = '';
    this.selectedDate = '';
    this.selectedMonth = '';
    this.currentPage = 1;
    this.filterByMonth();
  }

  // ================= PAGINATION (item summary / detailed tab) =================

  // combined site + date filter applied on top of the month-filtered summary
  // (same rules as the storekeeper dashboard's detailed report)
  get filteredSummary(): StockRow[] {
    return this.monthFilteredSummary.filter(stock => {

      // rows that actually have a site
      const hasSite =
        stock.siteName &&
        stock.siteName !== 'N/A';

      // rows still awaiting approval (may not have a
      // site assigned yet) — keep these visible too
      const awaitingApproval =
        stock.movementStatus === 'PENDING' ||
        stock.movementStatus === 'REJECTED';

      const siteMatches =
        !this.selectedSite ||
        stock.siteName === this.selectedSite;

      const dateMatches =
        !this.selectedDate ||
        stock.date === this.selectedDate;

      return (
        (hasSite || awaitingApproval) &&
        siteMatches &&
        dateMatches
      );
    });
  }

  get paginatedSummary(): StockRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSummary.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredSummary.length / this.pageSize));
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  // ================= OVERVIEW TAB: SEARCH + PAGINATION =================
  get filteredOverview(): StockRow[] {
    const term = this.overviewSearchTerm.trim().toLowerCase();

    if (!term) return this.stockSummary;

    return this.stockSummary.filter(s =>
      s.itemName?.toLowerCase().includes(term)
    );
  }

  get paginatedOverview(): StockRow[] {
    const filtered = this.filteredOverview;
    const start = (this.overviewCurrentPage - 1) * this.overviewPageSize;
    return filtered.slice(start, start + this.overviewPageSize);
  }

  get overviewTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOverview.length / this.overviewPageSize));
  }

  onOverviewSearch(): void {
    this.overviewCurrentPage = 1;
  }

  clearOverviewSearch(): void {
    this.overviewSearchTerm = '';
    this.overviewCurrentPage = 1;
  }

  overviewNextPage(): void {
    if (this.overviewCurrentPage < this.overviewTotalPages) this.overviewCurrentPage++;
  }

  overviewPrevPage(): void {
    if (this.overviewCurrentPage > 1) this.overviewCurrentPage--;
  }

  // ================= PAGINATION (site performance) =================
  get paginatedSiteSummary(): SiteOutRow[] {
    const start = (this.siteCurrentPage - 1) * this.sitePageSize;
    return this.siteOutSummary.slice(start, start + this.sitePageSize);
  }

  get siteTotalPages(): number {
    return Math.max(1, Math.ceil(this.siteOutSummary.length / this.sitePageSize));
  }

  siteNextPage(): void {
    if (this.siteCurrentPage < this.siteTotalPages) this.siteCurrentPage++;
  }

  sitePrevPage(): void {
    if (this.siteCurrentPage > 1) this.siteCurrentPage--;
  }

  // ================= LOGO (for PDF) =================
  private loadLogoAsBase64(): Promise<string> {
    if (this.logoBase64) {
      return Promise.resolve(this.logoBase64);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = 'assets/images/insta-logo.jpg';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Canvas context not available');
          return;
        }

        ctx.drawImage(img, 0, 0);
        this.logoBase64 = canvas.toDataURL('image/jpeg');
        resolve(this.logoBase64);
      };

      img.onerror = () => reject('Failed to load logo');
    });
  }

  // ================= PDF: DETAILED REPORT =================
  async downloadPDF(): Promise<void> {

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    // Logo (top-right, doesn't disturb existing text layout)
    try {
      const logo = await this.loadLogoAsBase64();
      doc.addImage(logo, 'JPEG', 160, 10, 35, 18);
    } catch (err) {
      console.warn('Logo could not be added to PDF', err);
    }

    doc.text('InstaPlus Service Ltd', 14, 20);
    doc.text('Monthly Stock Summary Report', 14, 30);
    doc.text(`Generated: ${today}`, 14, 40);
    doc.text(`By: ${this.userName}`, 14, 50);

    const data = this.filteredSummary.length
      ? this.filteredSummary
      : this.stockSummary;

    autoTable(doc, {
      startY: 65,
      head: [['Date', 'Item', 'Site', 'OUT', 'Status']],
      body: data.map(i => [
        i.date,
        i.itemName,
        i.siteName,
        i.qout,
        // stock_movement status, not the computed stock level
        i.movementStatus
      ])
    });

    doc.save(`stock-report-${today.replaceAll('/', '-')}.pdf`);
  }

  // ================= PDF: ITEM OVERVIEW =================
  async downloadOverviewPDF(): Promise<void> {

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    try {
      const logo = await this.loadLogoAsBase64();
      doc.addImage(logo, 'JPEG', 160, 10, 35, 18);
    } catch (err) {
      console.warn('Logo could not be added to PDF', err);
    }

    doc.text('InstaPlus Service Ltd', 14, 20);
    doc.text('Item Stock Overview Report', 14, 30);
    doc.text(`Generated: ${today}`, 14, 40);
    doc.text(`By: ${this.userName}`, 14, 50);

    autoTable(doc, {
      startY: 65,
      head: [['Item', 'QIN', 'QOUT', 'Qtotal', 'Status']],
      body: this.filteredOverview.map(i => [
        i.itemName,
        i.qin,
        i.qout,
        i.qtotal,
        i.status
      ])
    });

    doc.save(`item-stock-overview-${today.replaceAll('/', '-')}.pdf`);
  }

  // separate PDF export for site performance
  async downloadSitePDF(): Promise<void> {

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    // Logo (top-right, doesn't disturb existing text layout)
    try {
      const logo = await this.loadLogoAsBase64();
      doc.addImage(logo, 'JPEG', 160, 10, 35, 18);
    } catch (err) {
      console.warn('Logo could not be added to PDF', err);
    }

    doc.text('InstaPlus Service Ltd', 14, 20);
    doc.text('Stock Consumption by Site', 14, 30);
    doc.text(`Generated: ${today}`, 14, 40);
    doc.text(`By: ${this.userName}`, 14, 50);

    autoTable(doc, {
      startY: 65,
      head: [['Site', 'Total Stock OUT', 'Top Item', 'Top Item Qty']],
      body: this.siteOutSummary.map(s => [
        s.siteName,
        s.totalOut,
        s.topItemName,
        s.topItemOut
      ])
    });

    doc.save(`site-performance-${today.replaceAll('/', '-')}.pdf`);
  }
}