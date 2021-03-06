import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { AppChip } from '../../../../chips/chips.component';
import { APIResource } from '../../../../../../../../store/src/types/api.types';
import { CfRoute } from '../../../../../../../../store/src/types/route.types';

@Component({
  selector: 'app-table-cell-route-apps-attached',
  templateUrl: './table-cell-route-apps-attached.component.html',
  styleUrls: ['./table-cell-route-apps-attached.component.scss']
})
export class TableCellRouteAppsAttachedComponent implements OnInit {
  boundApps$: Observable<AppChip[]>;
  config$ = new BehaviorSubject(null);
  row$ = new BehaviorSubject(null);

  @Input('config')
  set config(config: any) {
    this.config$.next(config);
  }

  @Input('row')
  set row(route: APIResource<CfRoute>) {
    this.row$.next(route);
  }

  ngOnInit(): void {
    this.boundApps$ = combineLatest([
      this.config$.asObservable().pipe(first()),
      this.row$
    ]).pipe(
      map(([config, route]) => {
        return route.entity.apps ? route.entity.apps.map(app => {
          return {
            value: app.entity.name,
            url: {
              link: `/applications/${app.entity.cfGuid}/${app.metadata.guid}`,
              params: {
                breadcrumbs: config ? config.breadcrumbs : null
              },
            }
          };
        }) : [];
      })
    );
  }
}
