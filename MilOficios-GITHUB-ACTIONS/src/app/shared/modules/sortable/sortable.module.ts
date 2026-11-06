import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { sortableDirective } from './sortable.directive';

@NgModule({
  declarations: [sortableDirective],
  imports: [
    CommonModule
  ],
  exports:[sortableDirective]
})
export class SortableModule { }
