import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-alerta-general',
  templateUrl: './alerta-general.component.html',
  styleUrls: ['./alerta-general.component.scss']
})
export class AlertaGeneralComponent implements OnInit,OnChanges {
  
  @Input() tipoAlerta: string;
  @Input() mostrarAlerta: boolean=false;
  @Output() enviarEvento = new EventEmitter<boolean>();


  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  cerrarEvento(): void {
    // Acción al cerrar la alerta
    this.enviarEvento.emit(false);
  }

}
