import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from './core/auth-guard.service';
import { CoreModule } from './core/core.module';
import { EndpointsService } from './core/endpoints.service';
import { PageNotFoundComponentComponent } from './core/page-not-found-component/page-not-found-component.component';
import { CustomRoutingImportModule } from './custom-import.module';
import { DashboardBaseComponent } from './features/dashboard/dashboard-base/dashboard-base.component';
import { HomePageComponent } from './features/home/home/home-page.component';
import { NoEndpointsNonAdminComponent } from './features/no-endpoints-non-admin/no-endpoints-non-admin.component';
import { DomainMismatchComponent } from './features/setup/domain-mismatch/domain-mismatch.component';
import { ConsoleUaaWizardComponent } from './features/setup/uaa-wizard/console-uaa-wizard.component';
import { UpgradePageComponent } from './features/setup/upgrade-page/upgrade-page.component';
import { SharedModule } from './shared/shared.module';

const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'uaa', component: ConsoleUaaWizardComponent },
  { path: 'upgrade', component: UpgradePageComponent },
  { path: 'domainMismatch', component: DomainMismatchComponent },
  { path: 'login', loadChildren: './features/login/login.module#LoginModule' },
  {
    path: '',
    component: DashboardBaseComponent,
    canActivate: [AuthGuardService, EndpointsService],
    children: [
      {
        path: 'home', component: HomePageComponent,
        data: {
          stratosNavigation: {
            text: 'Home',
            matIcon: 'home',
            position: 10
          }
        }
      },
      {
        path: 'applications',
        loadChildren: './features/applications/applications.module#ApplicationsModule',
        data: {
          stratosNavigation: {
            text: 'Applications',
            matIcon: 'apps',
            position: 20
          }
        },
      },
      {
        path: 'endpoints',
        data: {
          stratosNavigation: {
            text: 'Endpoints',
            matIcon: 'settings_ethernet',
            position: 100
          }
        },
        children: [{
          path: '',
          loadChildren: './features/endpoints/endpoints.module#EndpointsModule',
        },
        {
          path: 'metrics',
          loadChildren: './features/metrics/metrics.module#MetricsModule',
        }]
      },
      {
        path: 'marketplace', loadChildren: './features/service-catalog/service-catalog.module#ServiceCatalogModule',
        data: {
          stratosNavigation: {
            text: 'Marketplace',
            matIcon: 'store',
            position: 30
          }
        },
      },
      {
        path: 'services', loadChildren: './features/services/services.module#ServicesModule',
        data: {
          stratosNavigation: {
            text: 'Services',
            matIcon: 'service',
            matIconFont: 'stratos-icons',
            position: 40
          }
        },
      },
      {
        path: 'cloud-foundry', loadChildren: './features/cloud-foundry/cloud-foundry.module#CloudFoundryModule',
        data: {
          stratosNavigation: {
            text: 'Cloud Foundry',
            matIcon: 'cloud_foundry',
            matIconFont: 'stratos-icons',
            position: 50
          }
        },
      },
      { path: 'about', loadChildren: './features/about/about.module#AboutModule' },
      { path: 'user-profile', loadChildren: './features/user-profile/user-profile.module#UserProfileModule' },
    ]
  },
  {
    path: 'noendpoints',
    component: NoEndpointsNonAdminComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: '**',
    component: PageNotFoundComponentComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    RouterModule.forRoot(appRoutes, { onSameUrlNavigation: 'reload' }),
    CustomRoutingImportModule,
  ]
})
export class RouteModule { }
