import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForgotComponent } from './forgot.component';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [{ path: '', component: ForgotComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule, ReactiveFormsModule],
  exports: [],
  declarations: [ForgotComponent]
})
export class ForgotModule {}
