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
import { StoreKeeperDashboard } from './storekeeper-dashboard';
import { ManagerDashboard } from './manager-dashboard';
import { AdminDashboard } from './admin-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: StaffRegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'items', component: ItemList },
  { path: 'add', component: ItemForm },
  { path: 'stock', component: StockMovementComponent },
  { path: 'approvals', component: StockApprovalComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'users', component: UserList },
  { path: 'user-form', component: UserForm },
  { path: 'store-dashboard', component: StoreKeeperDashboard },
  { path: 'manager-dashboard', component: ManagerDashboard },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: '**', redirectTo: 'register' }
];