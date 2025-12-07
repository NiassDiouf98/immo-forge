import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesLists } from './properties-lists';

describe('PropertiesLists', () => {
  let component: PropertiesLists;
  let fixture: ComponentFixture<PropertiesLists>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesLists]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesLists);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
