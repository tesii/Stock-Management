import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}



 canActivate(route:any) {


 const user = this.authService.getUser();


 if(!user){

   return this.router.createUrlTree(['/login']);

 }


 const roles = route.data?.roles;


 if(roles && !roles.includes(user.role)){


   this.authService.logout();

   return this.router.createUrlTree(['/login']);

 }


 return true;

}



};