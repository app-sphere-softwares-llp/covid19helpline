import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard.component';
import { DashboardDataResolver } from '../resolver/dashboardData.resolver';
import { NewPassComponent } from './new-pass/new-pass.component';
import { CreateAdminComponent } from './create-admin/create-admin.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {
      nzAutoGenerate: false
    },
    resolve: [DashboardDataResolver],
    children: [
      {
        path: '', redirectTo: '', pathMatch: 'full',component: HomeComponent
      },
      {
        path: 'dashboard', component: HomeComponent
      },

      {
        path: 'pass-request', component: NewPassComponent
      },
      {
        path: 'pass-request/:requestId', component: NewPassComponent
      },

      // super admin
      {
        path: 'create-admin', component: CreateAdminComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}
