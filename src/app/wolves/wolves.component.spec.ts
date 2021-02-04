import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolvesComponent } from './wolves.component';

describe('WolvesComponent', () => {
  let component: WolvesComponent;
  let fixture: ComponentFixture<WolvesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WolvesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WolvesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
