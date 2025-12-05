import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitiesSection } from './cities-section';

describe('CitiesSection', () => {
  let component: CitiesSection;
  let fixture: ComponentFixture<CitiesSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitiesSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitiesSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
