import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { ThemeConstantService } from '../shared/services/theme-constant.service';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard.component';
import { TemplateModule } from '../shared/template/template.module';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NewPassComponent } from './new-pass/new-pass.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    TemplateModule,
    CommonModule,
    SharedModule,
    DashboardRoutingModule,
    NzToolTipModule,
    ReactiveFormsModule
  ],
  exports: [
  ],
  declarations: [
    DashboardComponent,
    HomeComponent,
    NewPassComponent
  ],
  providers: [
    ThemeConstantService
  ]
})
export class DashboardModule {
}
