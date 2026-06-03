import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService, Item } from './item.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-form',
    standalone: true,
  imports: [CommonModule, FormsModule],

  templateUrl: './item-form.html',
    styleUrls: ['./item-form.css']   

})
export class ItemForm {

  // 🧾 Form model
  item: Item = {
    name: '',
    quantity: 0,
    unit: '',
    unitPrice: 0,
      minStockLevel: 0   
  };

  constructor(
    private itemService: ItemService,
    private router: Router
  ) {}

  // 💾 Save item to backend
  saveItem() {
    this.itemService.createItem(this.item).subscribe({
      next: () => {
        console.log('Item created successfully');
        this.router.navigate(['/']); // go back to list
      },
      error: (err) => {
        console.error('Error creating item:', err);
      }
    });
  }

  // 🔄 Optional: reset form
  resetForm() {
    this.item = {
      name: '',
      quantity: 0,
      unit: '',
      unitPrice: 0,
      minStockLevel: 0
    };
  }
}