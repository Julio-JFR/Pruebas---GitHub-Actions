import { Component, OnInit, ViewChild, Input } from '@angular/core';

@Component({
  selector: 'app-alerta-modal',
  templateUrl: './alerta-modal.component.html',
  styleUrls: ['./alerta-modal.component.scss']
})
export class AlertaModalComponent implements OnInit {

  @Input() tipoAlerta: string;

  constructor() { }

  ngOnInit(): void {
    
  }
}
