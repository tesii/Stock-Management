import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService, Item } from './item.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './item-form.html',
  styleUrls: ['./item-form.css']
})
export class ItemForm {


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



  // ================= SAVE ITEM =================

  saveItem(): void {

    this.itemService.createItem(this.item)

      .subscribe({

        next: () => {

          alert('Item created successfully');

          // return to inventory list
          this.router.navigate(['/items']);

        },


        error: (err) => {

          console.error('Error creating item:', err);

          alert('Failed to create item');

        }

      });

  }




  // ================= RESET =================

  resetForm(): void {

    this.item = {

      name: '',
      quantity: 0,
      unit: '',
      unitPrice: 0,
      minStockLevel: 0

    };

  }




  // ================= BACK =================

  goBack(): void {

    this.router.navigate(['/manager-dashboard']);

  }


}