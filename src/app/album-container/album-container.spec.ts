import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumContainer } from './album-container';

describe('AlbumContainer', () => {
  let component: AlbumContainer;
  let fixture: ComponentFixture<AlbumContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlbumContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
