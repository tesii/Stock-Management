import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Item, ItemService } from './item.service';
import { StockService } from './stock.service';
import { StockMovementComponent } from './stock_movement';

type StockStatus = 'low' | 'average' | 'high';

interface Site {
  id: number;
  siteName: string;
}

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StockMovementComponent
  ],
  templateUrl: './storekeeper-dashboard.html',
  styleUrls: ['./storekeeper-dashboard.css']
})
export class StoreKeeperDashboard implements OnInit {

  // =========================
  // VIEW
  // =========================

  currentView = 'dashboard';
  userName = 'Store Keeper';

  sidebarCollapsed = false;

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // =========================
  // DASHBOARD
  // =========================

  totalItems = 0;
  totalStockIn = 0;
  totalStockOut = 0;
  lowStockCount = 0;

  // =========================
  // SUMMARY
  // =========================

  stockSummary: any[] = [];

  chartData: { name: string; value: number }[] = [];

  lowStockThreshold = 10;

  lowStockItemIds: Set<number> = new Set();

  // =========================
  // FILTERS
  // =========================

  selectedMonth = '';

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  selectedSite = '';

  selectedDate = '';

  sites: Site[] = [];

  // =========================
  // DASHBOARD NOTIFICATIONS
  // =========================

  notifications: string[] = [];

  showNotifications = false;

  get notificationCount(): number {
    return this.notifications.length;
  }

  toggleNotifications(): void {

    this.showNotifications = !this.showNotifications;

    if (
      this.showNotifications &&
      this.notifications.length === 0
    ) {
      this.loadNotifications();
    }

  }

  // =========================
  // SUMMARY TABS
  // =========================

  summaryTab: 'overview' | 'detailed' = 'overview';

  setSummaryTab(
    tab: 'overview' | 'detailed'
  ): void {

    this.summaryTab = tab;

  }

  // =========================
  // SEARCH
  // =========================

  overviewSearchTerm = '';

  // =========================
  // PAGINATION
  // =========================

  currentPage = 1;

  pageSize = 10;

  overviewCurrentPage = 1;

  overviewPageSize = 10;

  // =========================
  // DATA
  // =========================

  private allMovements: any[] = [];

  constructor(
    private router: Router,
    private itemService: ItemService,
    private stockService: StockService,
    private http: HttpClient,
    @Inject(PLATFORM_ID)
    private platformId: object
  ) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {

      const userData = localStorage.getItem('user');

      if (userData) {

        const user = JSON.parse(userData);

        this.userName = user.username;

      }

    }

    this.loadSites();

    this.loadStockSummary();

  }

  // =========================
  // NAVIGATION
  // =========================

  setView(view: string): void {

    this.currentView = view;

  }

  logout(): void {

    if (isPlatformBrowser(this.platformId)) {

      localStorage.removeItem('user');

    }

    this.router.navigate(['/login']);

  }

  // =========================
  // LOAD SITES
  // =========================

  loadSites(): void {

    this.http
      .get<Site[]>(
        'http://localhost:8081/api/sites'
      )
      .subscribe({

        next: sites => {

          this.sites = sites;

        },

        error: err => {

          console.error(
            'Failed to load sites',
            err
          );

        }

      });

  }

  // =========================
  // LOAD STOCK
  // =========================

  private loadStockSummary(): void {

    this.stockService
      .getMovements()
      .subscribe({

        next: movements => {

          this.allMovements = movements;

          this.itemService
            .getItems()
            .subscribe({

              next: items => {

                this.processStock(
                  items,
                  movements
                );

              },

              error: err => {

                console.error(
                  'Failed loading items',
                  err
                );

              }

            });

        },

        error: err => {

          console.error(
            'Failed loading movements',
            err
          );

        }

      });

  }

  // =========================
  // FILTERS
  // =========================

  onSiteChange(): void {

    this.currentPage = 1;

  }

  onDateChange(): void {

    this.currentPage = 1;

  }

  clearDateFilter(): void {

    this.selectedDate = '';

    this.currentPage = 1;

  }

  clearAllFilters(): void {

    this.selectedSite = '';

    this.selectedDate = '';

    this.selectedMonth = '';

    this.currentPage = 1;

    this.filterByMonth();

  }

  // =========================
  // OVERVIEW SEARCH
  // =========================

  get filteredOverview() {

    const term =
      this.overviewSearchTerm
        .trim()
        .toLowerCase();

    if (!term) {

      return this.stockSummary;

    }

    return this.stockSummary.filter(item =>
      item.itemName
        ?.toLowerCase()
        .includes(term)
    );

  }

  get paginatedOverview() {

    const start =
      (this.overviewCurrentPage - 1)
      * this.overviewPageSize;

    return this.filteredOverview.slice(
      start,
      start + this.overviewPageSize
    );

  }

  get overviewTotalPages(): number {

    return (
      Math.ceil(
        this.filteredOverview.length /
        this.overviewPageSize
      ) || 1
    );

  }

  onOverviewSearch(): void {

    this.overviewCurrentPage = 1;

  }

  clearOverviewSearch(): void {

    this.overviewSearchTerm = '';

    this.overviewCurrentPage = 1;

  }

  overviewNextPage(): void {

    if (
      this.overviewCurrentPage <
      this.overviewTotalPages
    ) {

      this.overviewCurrentPage++;

    }

  }

  overviewPrevPage(): void {

    if (
      this.overviewCurrentPage > 1
    ) {

      this.overviewCurrentPage--;

    }

  }
  // =========================
// PAGINATION
// =========================

get filteredStock() {

  return this.stockSummary.filter(stock => {

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

get paginatedStock() {

  const start =
    (this.currentPage - 1) * this.pageSize;

  return this.filteredStock.slice(
    start,
    start + this.pageSize
  );

}

get totalPages(): number {

  return (
    Math.ceil(
      this.filteredStock.length / this.pageSize
    ) || 1
  );

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

// =========================
// MONTH FILTER
// =========================

filterByMonth(): void {

  const filtered = this.selectedMonth

    ? this.allMovements.filter(m => {

        const date = new Date(
          m.date ?? m.createdAt ?? ''
        );

        return (
          date.getMonth() ===
          this.months.indexOf(this.selectedMonth)
        );

      })

    : this.allMovements;

  this.itemService.getItems()
    .subscribe(items => {

      this.processStock(
        items,
        filtered
      );

    });

  this.currentPage = 1;

}

// =========================
// PROCESS STOCK
// =========================

private processStock(
  items: Item[],
  movements: any[]
): void {

  const itemMap = new Map<number, string>();

  const dbStock = new Map<number, number>();

  items.forEach(item => {

    if (!item.id) return;

    itemMap.set(item.id, item.name);

    dbStock.set(
      item.id,
      Number(item.quantity ?? 0)
    );

  });

  const movementMap = new Map<
    number,
    {
      in: number;
      out: number;
    }
  >();

  movements.forEach(movement => {

    if (!movement.itemId) return;

    const entry =
      movementMap.get(movement.itemId)
      ?? { in: 0, out: 0 };

    const qty =
      Number(movement.quantity ?? 0);

    if (movement.type === 'IN') {

      entry.in += qty;

    }

    if (movement.type === 'OUT') {

      entry.out += qty;

    }

    movementMap.set(
      movement.itemId,
      entry
    );

  });

  this.stockSummary =
    Array.from(dbStock.entries())
      .map(([id, stockLeft]) => {

        const movement =
          movementMap.get(id)
          ?? { in: 0, out: 0 };

        const minStock =

          items.find(
            i => i.id === id
          )?.minStockLevel

          ?? this.lowStockThreshold;

        let status: StockStatus = 'high';

        if (stockLeft <= minStock) {

          status = 'low';

        }

        else if (
          stockLeft <= minStock * 1.5
        ) {

          status = 'average';

        }

        // Most recent stock_movement record for this item —
        // used to surface the movement's own status
        // (e.g. APPROVED / PENDING / REJECTED) rather than
        // the computed stock-level status above.
        const latestMovement =
          movements.find(
            m => m.itemId === id
          );

        return {

          itemId: id,

          itemName:
            itemMap.get(id)
            ?? `Item ${id}`,

          qtotal: stockLeft,

          qin: movement.in,

          qout: movement.out,

          siteName:
            this.getSiteName(
              id,
              movements
            ),

          date:
            latestMovement?.date ?? '',

          // computed stock-level indicator (low/average/high)
          // kept for row coloring / low-stock badge
          status,

          // actual status straight from the stock_movement table
          movementStatus:
            latestMovement?.status
            ?? 'N/A'

        };

      });

  this.lowStockItemIds =
    new Set(

      this.stockSummary

        .filter(
          item =>
            item.status === 'low'
        )

        .map(
          item =>
            item.itemId
        )

    );

  const totalIn =
    this.stockSummary.reduce(

      (sum, item) =>

        sum + Number(item.qin),

      0

    );

  const totalOut =
    this.stockSummary.reduce(

      (sum, item) =>

        sum + Number(item.qout),

      0

    );

  this.chartData = [

    {
      name: 'IN',
      value: totalIn
    },

    {
      name: 'OUT',
      value: totalOut
    }

  ];

  // IMPORTANT
  this.updateDashboardStats();

}

// =========================
// DASHBOARD CARDS
// =========================

private updateDashboardStats(): void {

  this.totalItems =
    this.stockSummary.length;

  this.totalStockIn =
    this.stockSummary.reduce(

      (sum, item) =>

        sum + Number(item.qin),

      0

    );

  this.totalStockOut =
    this.stockSummary.reduce(

      (sum, item) =>

        sum + Number(item.qout),

      0

    );

  this.lowStockCount =
    this.stockSummary.filter(

      item =>
        item.status === 'low'

    ).length;

}

// =========================
// CHART
// =========================

maxChartValue(): number {

  return this.chartData.length

    ? Math.max(
        ...this.chartData.map(
          c => c.value
        )
      )

    : 1;

}

// =========================
// SITE NAME
// =========================

getSiteName(
  itemId: number,
  movements: any[]
): string {

  const movement =
    movements.find(
      m =>
        m.itemId === itemId &&
        m.site
    );

  return (
    movement?.site?.siteName ??
    'N/A'
  );

}

// =========================
// PDF
// =========================

downloadOverviewPDF(): void {

  const doc = new jsPDF();

  autoTable(doc, {

    head: [[
      'Item',
      'IN',
      'OUT',
      'Stock',
      'Status'
    ]],

    body:
      this.filteredOverview.map(

        item => [

          item.itemName,

          item.qin,

          item.qout,

          item.qtotal,

          item.status

        ]

      )

  });

  doc.save(
    'item-stock-overview.pdf'
  );

}

downloadPDF(): void {

  const doc = new jsPDF();

  autoTable(doc, {

    head: [[
      'Item',
      'IN',
      'OUT',
      'Stock',
      'Status'
    ]],

    body:
      this.filteredStock.map(

        item => [

          item.itemName,

          item.qin,

          item.qout,

          item.qtotal,

          // stock_movement status, not the computed stock level
          item.movementStatus

        ]

      )

  });

  doc.save(
    'monthly-stock-report.pdf'
  );

}

// =========================
// NOTIFICATIONS
// =========================

private loadNotifications(): void {

  this.stockService
    .getMovements()
    .subscribe(movements => {

      const approved =
        movements.filter(
          m =>
            m.status === 'APPROVED'
        ).length;

      const pending =
        movements.filter(
          m =>
            m.status === 'PENDING'
        ).length;

      this.notifications = [

        approved
          ? `✅ ${approved} approved`
          : 'No approvals',

        pending
          ? `⏳ ${pending} pending`
          : '',

        '📊 Stock updated'

      ].filter(Boolean) as string[];

    });

}

}