import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarModule } from '../shared/navbar/navbar.module';

@NgModule({
    
    imports: [
        CommonModule,
        TranslateModule,
        NavbarModule,
        FormsModule,
        NgbModule,
        HomeRoutingModule],
    declarations: [HomeComponent]
})
export class HomeModule {}
