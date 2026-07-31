
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, Audit } from './audit.service';
import { ItemService, Item } from './item.service';
import { StockService, StockMovement } from './stock.service';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-list.html',
  styleUrls: ['./audit-list.css']
})
export class AuditList implements OnInit {

  audits: Audit[] = [];
  filteredAudits: Audit[] = [];

  // for resolving entityId -> item name
  items: Item[] = [];

  // ✅ NEW: for resolving StockMovement entityId -> item + direction (IN/OUT)
  movements: StockMovement[] = [];

  // ================= FILTERS =================
  searchText: string = '';
  selectedRole: string = '';
  selectedAction: string = '';

  roles: string[] = ['ADMIN', 'MANAGER', 'STORE_KEEPER'];
  actions: string[] = [];

  // ================= PAGINATION =================
  currentPage: number = 1;
  pageSize: number = 15;

  constructor(
    private auditService: AuditService,
    private itemService: ItemService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.loadItems();
    this.loadMovements();
    this.loadAudits();
  }

  loadItems(): void {
    this.itemService.getItems().subscribe({
      next: (data) => { this.items = data; },
      error: (err) => console.error('Failed loading items', err)
    });
  }

  // ✅ NEW
  loadMovements(): void {
    this.stockService.getMovements().subscribe({
      next: (data) => { this.movements = data; },
      error: (err) => console.error('Failed loading movements', err)
    });
  }

  loadAudits(): void {
    this.auditService.getAudits().subscribe({
      next: (data) => {
        this.audits = data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        this.actions = Array.from(new Set(this.audits.map(a => a.action))).sort();

        this.applyFilters();
      },
      error: (err) => console.error('Failed loading audits', err)
    });
  }

  applyFilters(): void {
    const term = this.searchText.trim().toLowerCase();

    this.filteredAudits = this.audits.filter(a => {
      const matchesSearch = !term ||
        a.username?.toLowerCase().includes(term) ||
        a.entityName?.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term) ||
        this.getEntityDisplay(a).toLowerCase().includes(term) ||
        this.getDescriptionDisplay(a).toLowerCase().includes(term); // ✅ allow searching by labeled item too

      const matchesRole = !this.selectedRole || a.role === this.selectedRole;
      const matchesAction = !this.selectedAction || a.action === this.selectedAction;

      return matchesSearch && matchesRole && matchesAction;
    });

    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedRole = '';
    this.selectedAction = '';
    this.applyFilters();
  }

  // ================= ACTION BADGE STYLING =================
  getActionClass(action: string): string {
    const a = action?.toUpperCase() ?? '';

    if (a.includes('DELETE') || a.includes('REJECT')) return 'action-danger';
    if (a.includes('CREATE') || a.includes('APPROVE') || a.includes('LOGIN')) return 'action-success';
    if (a.includes('UPDATE') || a.includes('EDIT')) return 'action-warning';
    return 'action-default';
  }

  // ================= RESOLVE ENTITY DISPLAY NAME =================
  getEntityDisplay(log: Audit): string {
    if (!log.entityId) return log.entityName ?? '—';

    if (log.entityName === 'Item') {
      const item = this.items.find(i => i.id === log.entityId);
      return item ? item.name : `Item #${log.entityId}`;
    }

    return `${log.entityName} #${log.entityId}`;
  }

  // ================= NEW: LABELED DESCRIPTION (ITEM + IN/OUT) =================
  getDescriptionDisplay(log: Audit): string {

    // Only enrich rows related to stock movements
    if (log.entityName !== 'StockMovement' || !log.entityId) {
      return log.description ?? '—';
    }

    const movement = this.movements.find(m => m.id === log.entityId);

    if (!movement) {
      return log.description ?? '—';
    }

    const item = this.items.find(i => i.id === movement.itemId);
    const itemName = item ? item.name : `Item #${movement.itemId}`;
    const direction = movement.type === 'IN' ? 'Stock IN' : 'Stock OUT';

    const label = `${direction} — ${itemName} (${movement.quantity} units)`;

    // keep original description too, if it adds extra context beyond the label
    return log.description ? `${label} — ${log.description}` : label;
  }

  // ================= PAGINATION =================
  get paginatedAudits(): Audit[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAudits.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAudits.length / this.pageSize));
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }
}