import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertaModalComponent } from './alerta-modal.component';

describe('AlertaModalComponent', () => {
  let component: AlertaModalComponent;
  let fixture: ComponentFixture<AlertaModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertaModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
