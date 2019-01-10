import { Observable } from 'rxjs';

import { IApp, ISpace } from '../../../core/cf-api.types';
import { getStartedAppInstanceCount } from '../../../core/cf.helpers';
import { EntityMonitorFactory } from '../../../shared/monitors/entity-monitor.factory.service';
import { CardStatus } from '../../../shared/shared.types';
import { spaceSchemaKey } from '../../../store/helpers/entity-factory';
import { APIResource } from '../../../store/types/api.types';
import { CloudFoundryEndpointService } from './cloud-foundry-endpoint.service';
import { OrgSpaceQuotaHelper } from './cloud-foundry-org-space-quota';

export class SpaceQuotaHelper extends OrgSpaceQuotaHelper<ISpace> {
  constructor(
    cfEndpointService: CloudFoundryEndpointService,
    emf: EntityMonitorFactory,
    spaceGuid: string) {
    super(
      cfEndpointService,
      emf,
      spaceGuid,
      spaceSchemaKey,
    );
  }

  protected quotaPropertyName: 'quota_definition' | 'space_quota_definition' = 'space_quota_definition';
  protected fetchAppsFn = (space: APIResource<ISpace>): Observable<APIResource<IApp>[]> =>
    this.cfEndpointService.getAppsInSpaceViaAllApps(space)
  protected getOrgOrSpaceCardStatus = (space: APIResource<ISpace>, apps: APIResource<IApp>[]): CardStatus => {
    const spaceQuota = space.entity.space_quota_definition;
    // Ensure we check each on in turn
    return this.handleQuotaStatus(space.entity.routes.length, spaceQuota.entity.total_routes) ||
      this.handleQuotaStatus(space.entity.service_instances.length, spaceQuota.entity.total_services) ||
      this.handleQuotaStatus(getStartedAppInstanceCount(apps), spaceQuota.entity.app_instance_limit) ||
      this.handleQuotaStatus(this.cfEndpointService.getMetricFromApps(apps, 'memory'), spaceQuota.entity.memory_limit) ?
      CardStatus.WARNING :
      CardStatus.NONE;
  }
}


// function handleStatus(value: number, limit: number): CardStatus {
//   const status = determineCardStatus(value, limit);
//   return status === CardStatus.WARNING || status === CardStatus.ERROR ? CardStatus.WARNING : null;
// }

// function _createSpaceStateObs(
//   cfEndpointService: CloudFoundryEndpointService,
//   space$: Observable<APIResource<ISpace>>,
//   apps$: Observable<APIResource<IApp>[]>,
// ): Observable<CardStatus> {
//   return combineLatest(
//     space$,
//     apps$
//   ).pipe(
//     first(),
//     map(([space, apps]) => {
//       const spaceQuota = space.entity.space_quota_definition;
//       // Ensure we check each on in turn
//       return handleStatus(space.entity.routes.length, spaceQuota.entity.total_routes) ||
//         handleStatus(space.entity.service_instances.length, spaceQuota.entity.total_services) ||
//         handleStatus(getStartedAppInstanceCount(apps), spaceQuota.entity.app_instance_limit) ||
//         handleStatus(cfEndpointService.getMetricFromApps(apps, 'memory'), spaceQuota.entity.memory_limit) ?
//         CardStatus.WARNING :
//         CardStatus.NONE;
//     })
//   );
// }

// function hasQuotas(space$: Observable<APIResource<ISpace>>): Observable<boolean> {
//   return space$.pipe(
//     map(space =>
//       !!space.entity.space_quota_definition && (
//         truthyIncludingZero(space.entity.space_quota_definition.entity.total_routes) ||
//         truthyIncludingZero(space.entity.space_quota_definition.entity.total_services) ||
//         truthyIncludingZero(space.entity.space_quota_definition.entity.app_instance_limit) ||
//         truthyIncludingZero(space.entity.space_quota_definition.entity.memory_limit))
//     )
//   );
// }

// function createAllAppsInSpaceObs(
//   space$: Observable<APIResource<ISpace>>,
//   cfEndpointService: CloudFoundryEndpointService): Observable<APIResource<IApp>[]> {
//   return space$.pipe(
//     switchMap(space => cfEndpointService.getAppsInSpaceViaAllApps(space))
//   );
// }

// export function createSpaceStateObs(
//   spaceGuid: string,
//   cfEndpointService: CloudFoundryEndpointService,
//   emf: EntityMonitorFactory): Observable<CardStatus> {
//   // It can be expensive to iterate over apps to determine usage, so cut out early if there's no quotas or we can't determine all apps
//   const space$ = emf.create<APIResource<ISpace>>(
//     spaceGuid,
//     spaceSchemaKey,
//     entityFactory(spaceSchemaKey),
//     false).entity$.pipe(filter(space => !!space));
//   return combineLatest(
//     hasQuotas(space$),
//     cfEndpointService.hasAllApps$
//   ).pipe(
//     switchMap(([validQuotas, hasApps]) =>
//       validQuotas && hasApps ?
//         _createSpaceStateObs(cfEndpointService, space$, createAllAppsInSpaceObs(space$, cfEndpointService)) :
//         observableOf(CardStatus.NONE))
//   );
// }
