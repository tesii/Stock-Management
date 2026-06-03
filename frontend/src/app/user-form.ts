import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { API_BASE_URL } from './api';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.css']
})
export class UserForm implements OnInit {
  id: number | null = null;
  username = '';
  password = '';
  role = 'STORE_KEEPER';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const q = this.route.snapshot.queryParams;
    if (q['id']) {
      this.id = +q['id'];
      fetch(`${API_BASE_URL}/users/${this.id}`).then(r => r.json()).then(j => {
        this.username = j.username || '';
        this.role = j.role || 'STORE_KEEPER';
      });
    }
  }

  save() {
    const payload: any = { username: this.username, role: this.role };
    if (this.password) payload.password = this.password;

    const currentUser = localStorage.getItem('user');
    const currentRole = currentUser ? JSON.parse(currentUser).role : null;
    const targetDashboard = currentRole === 'ADMIN'
      ? '/admin-dashboard'
      : currentRole === 'MANAGER'
      ? '/manager-dashboard'
      : '/store-dashboard';

    const redirect = () => this.router.navigate([targetDashboard], { queryParams: { view: 'users' } });

    if (this.id) {
      fetch(`${API_BASE_URL}/users/${this.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(() => redirect());
    } else {
      if (!this.password) { alert('Password required for new user'); return; }
      fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(() => redirect());
    }
  }
}
