import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MePage } from './me-page';

describe('MePage', () => {
  let component: MePage;
  let fixture: ComponentFixture<MePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
