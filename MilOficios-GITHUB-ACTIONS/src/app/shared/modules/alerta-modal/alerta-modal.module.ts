import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertaModalComponent } from './alerta-modal.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertaGeneralComponent } from '../alerta-general/alerta-general.component';


@NgModule({
    imports: [CommonModule, RouterModule, NgbModule],
    declarations: [AlertaModalComponent,AlertaGeneralComponent],
    exports: [AlertaModalComponent,AlertaGeneralComponent]
})
export class AlertaModalModule {}
