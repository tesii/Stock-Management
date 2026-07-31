import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard';
import { LoginComponent } from './login';
import { StaffRegisterComponent } from './register';
import { ItemList } from './item-list';
import { ItemForm } from './item-form';
import { StockMovementComponent } from './stock_movement';
import { StockApprovalComponent } from './stock-approval';
import { UserList } from './user-list';
import { UserForm } from './user-form';
import { AuditList } from './audit-list';

import { AuthGuard } from './auth.guard';

import { StoreKeeperDashboard } from './storekeeper-dashboard';
import { ManagerDashboard } from './manager-dashboard';
import { AdminDashboard } from './admin-dashboard';

import { SiteComponent } from './site';
import { SiteFormComponent } from './site-form';


export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  {
    path: 'login',
    component: LoginComponent
  },

  {
 path:'audits',
 component:AuditList
},

  {
    path: 'register',
    component: StaffRegisterComponent
  },


  // ================= DASHBOARDS =================

  {
    path: 'store-dashboard',
    component: StoreKeeperDashboard,
    canActivate: [AuthGuard],
    data: {
      roles: ['STORE_KEEPER']
    }
  },


  {
    path: 'manager-dashboard',
    component: ManagerDashboard,
    canActivate: [AuthGuard],
    data: {
      roles: ['MANAGER']
    }
  },


  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [AuthGuard],
    data: {
      roles: ['ADMIN']
    }
  },



  // ================= INVENTORY =================

  {
    path: 'items',
    component: ItemList,
    canActivate:[AuthGuard],
    data:{
      roles:['MANAGER','ADMIN']
    }
  },


  {
    path: 'item-form',
    component: ItemForm,
    canActivate:[AuthGuard],
    data:{
      roles:['MANAGER','ADMIN']
    }
  },


  {
    path: 'stock',
    component: StockMovementComponent,
    canActivate:[AuthGuard],
    data:{
      roles:['STORE_KEEPER']
    }
  },


  {
    path:'approvals',
    component:StockApprovalComponent,
    canActivate:[AuthGuard],
    data:{
      roles:['MANAGER']
    }
  },



  // ================= USERS =================

  {
    path:'users',
    component:UserList,
    canActivate:[AuthGuard],
    data:{
      roles:['ADMIN']
    }
  },


  {
    path:'user-form',
    component:UserForm,
    canActivate:[AuthGuard],
    data:{
      roles:['ADMIN']
    }
  },



  // ================= SITE =================

  {
    path:'site',
    component:SiteComponent,
    canActivate:[AuthGuard],
    data:{
      roles:['ADMIN','MANAGER']
    }
  },


  {
    path:'site-form',
    component:SiteFormComponent,
    canActivate:[AuthGuard],
    data:{
      roles:['ADMIN']
    }
  },


  {
    path:'site-form/:id',
    component:SiteFormComponent,
    canActivate:[AuthGuard],
    data:{
      roles:['ADMIN']
    }
  },


  // ================= DEFAULT =================

  {
    path:'**',
    redirectTo:'login'
  }

];