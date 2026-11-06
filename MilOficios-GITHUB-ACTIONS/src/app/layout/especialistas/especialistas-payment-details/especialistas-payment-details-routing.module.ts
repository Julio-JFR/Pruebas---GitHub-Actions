import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspecialistasPaymentDetailsComponent } from './especialistas-payment-details.component';

const routes: Routes = [
    {
        path: '',
        component: EspecialistasPaymentDetailsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EspecialistasPaymentDetailsRoutingModule { }
