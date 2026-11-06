import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriangularBarComponent } from './triangular-bar/triangular-bar.component';



@NgModule({
  declarations: [
    TriangularBarComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[TriangularBarComponent]
})
export class ComponentsModule { }
