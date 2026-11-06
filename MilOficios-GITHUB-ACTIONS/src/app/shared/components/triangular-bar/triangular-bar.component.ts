import { Component, Input } from '@angular/core';

@Component({
  selector: 'triangular-bar',
  templateUrl: './triangular-bar.component.html',
  styleUrls: ['./triangular-bar.component.scss']
})
export class TriangularBarComponent {
  @Input() isProfile:boolean=false;
}
