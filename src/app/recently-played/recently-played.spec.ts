import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentlyPlayed } from './recently-played';

describe('RecentlyPlayed', () => {
  let component: RecentlyPlayed;
  let fixture: ComponentFixture<RecentlyPlayed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentlyPlayed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentlyPlayed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
