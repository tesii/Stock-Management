import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  username = '';
  password = '';
  error = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.username || !this.password) {
      this.error = 'Enter both username and password.';
      return;
    }

    this.error = '';
    this.isSubmitting = true;

    this.authService.login(this.username, this.password)
      .subscribe({
        next: (user) => {
          this.isSubmitting = false;

          if (!user) {
            this.error = 'Invalid credentials';
            return;
          }

          localStorage.setItem('user', JSON.stringify(user));

          if (user.role === 'ADMIN') {
            this.router.navigate(['/admin-dashboard']);
          } else if (user.role === 'MANAGER') {
            this.router.navigate(['/manager-dashboard']);
          } else if (user.role === 'STORE_KEEPER') {
            this.router.navigate(['/store-dashboard']);
          } else {
            this.router.navigate(['/items']);
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.error = 'Login failed';
        }
      });
  }
}