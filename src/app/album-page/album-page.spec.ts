import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumPage } from './album-page';

describe('AlbumPage', () => {
  let component: AlbumPage;
  let fixture: ComponentFixture<AlbumPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlbumPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
