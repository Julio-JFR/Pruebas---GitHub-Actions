import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PageHeaderComponent } from './page-header.component';
import { AlertaModalModule } from '../alerta-modal/alerta-modal.module';

@NgModule({
    imports: [CommonModule, RouterModule,
        AlertaModalModule],
    declarations: [PageHeaderComponent],
    exports: [PageHeaderComponent]
})
export class PageHeaderModule {}
