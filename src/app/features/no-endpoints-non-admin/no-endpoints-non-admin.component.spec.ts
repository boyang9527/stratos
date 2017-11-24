import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../core/core.module';
import { NoContentMessageComponent } from '../../shared/components/no-content-message/no-content-message.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoEndpointsNonAdminComponent } from './no-endpoints-non-admin.component';
import { StoreModule } from '@ngrx/store';
import { appReducers } from '../../store/reducers.module';
import { getInitialTestStoreState } from '../../test-framework/store-test-helper';

describe('NoEndpointsNonAdminComponent', () => {
  let component: NoEndpointsNonAdminComponent;
  let fixture: ComponentFixture<NoEndpointsNonAdminComponent>;
  const initialState = getInitialTestStoreState();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NoEndpointsNonAdminComponent],
      imports: [
        CoreModule,
        SharedModule,
        StoreModule.forRoot(appReducers,
          {
            initialState
          })
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoEndpointsNonAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
