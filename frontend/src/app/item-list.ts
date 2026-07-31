import { Component, OnInit, OnDestroy  } from '@angular/core';
import { ItemService, Item } from './item.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './item-list.html',
  styleUrls: ['./item-list.css']
})
export class ItemList implements OnInit, OnDestroy  {


  // ================= DATA =================

  items: Item[] = [];

  searchText: string = '';


  // ================= STATS =================

  totalItems: number = 0;

  totalValue: number = 0;

  lowStockCount: number = 0;



  // ================= PAGINATION =================

  currentPage: number = 1;

  pageSize: number = 10;

    private refreshInterval: any;



  constructor(
    private itemService: ItemService,
    private router: Router
  ) {}





  // ================= INIT =================

ngOnInit(): void {

  // Initial load
  this.loadItems();

  // Refresh every 30 seconds
  this.refreshInterval = setInterval(() => {
    this.loadItems();
  }, 30000);

}


ngOnDestroy(): void {

  if (this.refreshInterval) {
    clearInterval(this.refreshInterval);
  }

}


  // ================= LOAD ITEMS =================

  loadItems(): void {


    this.itemService.getItems()

      .subscribe({

        next: (data) => {

          this.items = data;

          this.calculateStats();

        },


        error: (err) => {

          console.error('Failed to load items', err);

        }

      });


  }







  // ================= ADD ITEM =================

  addItem(): void {

    this.router.navigate(['/item-form']);

  }






  // ================= DELETE ITEM =================

  deleteItem(id: number): void {


    if(confirm('Are you sure you want to delete this item?')) {


      this.itemService.deleteItem(id)

        .subscribe({

          next: () => {

            this.loadItems();

          },


          error: (err) => {

            console.error('Failed to delete item', err);

          }

        });


    }


  }







  // ================= CALCULATE STATISTICS =================

  calculateStats(): void {


    this.totalItems = this.items.length;



    this.totalValue = this.items.reduce((sum, item) => {

      return sum + ((item.quantity || 0) * (item.unitPrice || 0));

    }, 0);




    this.lowStockCount = this.items.filter(item => {


      const min = item.minStockLevel ?? 0;

      const qty = item.quantity ?? 0;


      return qty <= min;


    }).length;


  }







  // ================= STOCK STATUS =================

  getStockStatus(item: Item): 'low' | 'medium' | 'high' {


    const min = item.minStockLevel ?? 0;

    const qty = item.quantity ?? 0;



    if (qty <= min) {

      return 'low';

    }


    if (qty <= min * 1.5) {

      return 'medium';

    }


    return 'high';


  }







  // ================= SEARCH =================

  get filteredItems(): Item[] {


    return this.items.filter(item =>


      item.name

        .toLowerCase()

        .includes(this.searchText.toLowerCase())


    );


  }






  // ================= PAGINATION =================


  get paginatedItems(): Item[] {


    const start = (this.currentPage - 1) * this.pageSize;


    return this.filteredItems.slice(

      start,

      start + this.pageSize

    );


  }





  get totalPages(): number {


    return Math.ceil(

      this.filteredItems.length / this.pageSize

    );


  }





  nextPage(): void {


    if(this.currentPage < this.totalPages) {

      this.currentPage++;

    }


  }





  prevPage(): void {


    if(this.currentPage > 1) {

      this.currentPage--;

    }


  }





  goToPage(page:number): void {

    this.currentPage = page;

  }


}