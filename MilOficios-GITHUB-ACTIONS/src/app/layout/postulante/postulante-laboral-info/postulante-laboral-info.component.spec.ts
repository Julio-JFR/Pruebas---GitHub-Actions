import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostulanteLaboralInfoComponent } from './postulante-laboral-info.component';

describe('PostulanteLaboralInfoComponent', () => {
  let component: PostulanteLaboralInfoComponent;
  let fixture: ComponentFixture<PostulanteLaboralInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostulanteLaboralInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostulanteLaboralInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
