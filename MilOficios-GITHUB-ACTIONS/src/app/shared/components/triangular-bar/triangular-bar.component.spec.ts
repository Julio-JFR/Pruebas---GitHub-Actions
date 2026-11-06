import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriangularBarComponent } from './triangular-bar.component';

describe('TriangularBarComponent', () => {
  let component: TriangularBarComponent;
  let fixture: ComponentFixture<TriangularBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TriangularBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TriangularBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
