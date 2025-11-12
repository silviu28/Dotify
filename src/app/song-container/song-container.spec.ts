import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongContainer } from './song-container';

describe('SongContainer', () => {
  let component: SongContainer;
  let fixture: ComponentFixture<SongContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
