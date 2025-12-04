import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistListing } from './artist-listing';

describe('ArtistListing', () => {
  let component: ArtistListing;
  let fixture: ComponentFixture<ArtistListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistListing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistListing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
