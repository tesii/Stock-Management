import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-staff-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './staff-register.html',
  styleUrls: ['./staff-register.css']
})
export class StaffRegisterComponent {

  user = {
    username: '',
    password: '',
    role: 'STORE_KEEPER'
  };

  isSubmitting = false;

  // ================= MESSAGE SYSTEM =================
  message = '';
  messageType: 'success' | 'error' | 'warning' | '' = '';

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  // ================= PASSWORD CHECK =================
  checkPassword(password: string): boolean {

    if (!password) {
      this.messageType = 'error';
      this.message = 'Password is required';
      return false;
    }

    if (password.length < 6) {
      this.messageType = 'error';
      this.message = 'Weak password ❌ (minimum 6 characters)';
      return false;
    }

    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!strongRegex.test(password)) {
      this.messageType = 'warning';
      this.message =
        'Medium password ⚠️ Add uppercase letters and numbers';
      return false;
    }

    this.messageType = 'success';
    this.message = 'Strong password ✅';
    return true;
  }

  // ================= REGISTER =================
  register() {

    const { username, password } = this.user;

    // empty fields
    if (!username || !password) {
      this.messageType = 'error';
      this.message = 'Username and password are required';
      return;
    }

    // password validation
    if (!this.checkPassword(password)) {
      return;
    }

    this.isSubmitting = true;

    this.authService.registerStaff(this.user).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.messageType = 'success';
        this.message = 'Account created successfully! Redirecting...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },

      error: (err) => {
        this.isSubmitting = false;

        this.messageType = 'error';
        this.message =
          err.error?.message || 'Registration failed. Try again.';
      }
    });
  }
}