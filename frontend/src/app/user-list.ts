import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { API_BASE_URL } from './api';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserList implements OnInit {
  users: any[] = [];

  ngOnInit(): void {
    this.load();
  }

  load() {
    fetch(`${API_BASE_URL}/users`).then(r => r.json()).then(j => this.users = j || []);
  }

  deleteUser(id: number) {
    if (!confirm('Delete user?')) return;
    fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' }).then(() => this.load());
  }
}
