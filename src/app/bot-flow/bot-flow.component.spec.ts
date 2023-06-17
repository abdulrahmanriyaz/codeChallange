import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotFlowComponent } from './bot-flow.component';

describe('BotFlowComponent', () => {
  let component: BotFlowComponent;
  let fixture: ComponentFixture<BotFlowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BotFlowComponent]
    });
    fixture = TestBed.createComponent(BotFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
