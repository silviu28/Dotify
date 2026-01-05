import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongPreview } from './song-preview';

describe('SongPreview', () => {
  let component: SongPreview;
  let fixture: ComponentFixture<SongPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
