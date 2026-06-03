import { Component, OnInit } from '@angular/core';
import { StockService, StockMovement } from './stock.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-approval',
   standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-approval.html',
    styleUrls: ['./stock-approval.css']

})
export class StockApprovalComponent implements OnInit {

  pending: StockMovement[] = [];

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadPending();
  }

loadPending() {
  this.stockService.getPendingOut().subscribe({
    next: (data) => {
      this.pending = data.filter(m => m.status === 'PENDING');
    },
    error: (err) => console.error(err)
  });
}

  approve(id: number) {
    this.stockService.approveMovement(id).subscribe({
      next: () => {
        alert('Approved!');
        this.loadPending();
      }
    });
  }

  reject(id: number) {
    this.stockService.rejectMovement(id).subscribe({
      next: () => {
        alert('Rejected!');
        this.loadPending();
      }
    });
  }
}