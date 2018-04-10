import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewThreadComponent } from './view-thread.component';

describe('ViewThreadComponent', () => {
  let component: ViewThreadComponent;
  let fixture: ComponentFixture<ViewThreadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewThreadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
