import { Component, OnInit } from '@angular/core';
import { StockService, StockMovement } from './stock.service';
import { ItemService, Item } from './item.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ItemFilterPipe } from './item-filter-pipe';

@Component({
  selector: 'app-stock-movement',
    standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock_movement.html',
      styleUrls: ['./stock_movement.css']   

})
export class StockMovementComponent implements OnInit {

  items: Item[] = [];

  form: StockMovement = {
    itemId: 0,
    type: 'IN',
    quantity: 0,
    site: '',
    note: ''
  };

  constructor(
    private stockService: StockService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems() {
    this.itemService.getItems().subscribe({
      next: (data) => this.items = data,
      error: (err) => console.error(err)
    });
  }

  submit() {
    this.stockService.createMovement(this.form).subscribe({
      next: () => {
        alert('Stock movement saved!');
        this.resetForm();
        this.loadItems(); // refresh stock if needed
      },
      error: (err) => console.error(err)
    });
  }

  resetForm() {
    this.form = {
      itemId: 0,
      type: 'IN',
      quantity: 0,
      site: '',
      note: ''
    };
  }
}