import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseTestModulesNoShared } from '../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { TableCellFavoriteComponent } from './table-cell-favorite.component';

describe('TableCellFavoriteComponent', () => {
  let component: TableCellFavoriteComponent<any>;
  let fixture: ComponentFixture<TableCellFavoriteComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TableCellFavoriteComponent,
      ],
      imports: [
        ...BaseTestModulesNoShared
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellFavoriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
