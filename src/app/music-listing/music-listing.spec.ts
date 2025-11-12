import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicListing } from './music-listing';

describe('MusicListing', () => {
  let component: MusicListing;
  let fixture: ComponentFixture<MusicListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicListing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicListing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
