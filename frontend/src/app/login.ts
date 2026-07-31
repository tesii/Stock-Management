import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
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



  login(): void {


    // ================= VALIDATION =================

    if (!this.username.trim() || !this.password.trim()) {

      this.error = 'Enter both username and password.';
      return;

    }


    this.error = '';
    this.isSubmitting = true;



    // ================= LOGIN REQUEST =================

    this.authService.login(
      this.username,
      this.password
    )
    .subscribe({

      next: (res: any) => {


        this.isSubmitting = false;


        console.log('Login response:', res);



        // ================= CHECK LOGIN SUCCESS =================

        if (!res.success) {

          this.error = res.message ?? 'Invalid username or password.';
          return;

        }



        const user = res.user;



        // ================= CHECK USER =================

        if (!user || !user.role) {

          this.error = 'Invalid user information received.';
          return;

        }



        // ================= SAVE USER =================

        localStorage.setItem(
          'user',
          JSON.stringify(user)
        );



        // ================= ROLE BASED REDIRECTION =================


        switch(user.role) {


          case 'ADMIN':

            this.router.navigate(['/admin-dashboard']);

            break;



          case 'MANAGER':

            this.router.navigate(['/manager-dashboard']);

            break;



          case 'STORE_KEEPER':

            this.router.navigate(['/store-dashboard']);

            break;



          default:

            this.error = 'Unknown user role.';

            localStorage.removeItem('user');

            break;

        }


      },



      error: (err) => {


        this.isSubmitting = false;


        console.error(
          'Login error:',
          err
        );


        this.error =
          'Server error. Please try again later.';


      }


    });


  }


}