import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, mergeMap, withLatestFrom } from 'rxjs/operators';
import { LoggerService } from '../../core/logger.service';
import {
  GetAppAutoscalerPolicyAction,
  GetAppAutoscalerHealthAction,
  GetAppAutoscalerScalingHistoryAction,
  GetAppAutoscalerMetricAction,
  UpdateAppAutoscalerPolicyAction,
  DetachAppAutoscalerPolicyAction,
  APP_AUTOSCALER_POLICY,
  APP_AUTOSCALER_HEALTH,
  APP_AUTOSCALER_SCALING_HISTORY,
  FETCH_APP_AUTOSCALER_METRIC,
  UPDATE_APP_AUTOSCALER_POLICY,
  DETACH_APP_AUTOSCALER_POLICY,
} from '../actions/app-autoscaler.actions';
import { NormalizedResponse } from '../types/api.types';
import {
  ICFAction,
  StartRequestAction,
  WrapperRequestActionFailed,
  WrapperRequestActionSuccess,
} from '../types/request.types';
import { AppState } from '../app-state';
import { environment } from '../../../environments/environment';
import { Headers, Http, Request, RequestOptions, URLSearchParams } from '@angular/http';
import { PaginatedAction } from './../types/pagination.types';
import {
  autoscalerTransformArrayToMap,
  autoscalerTransformMapToArray,
  buildMetricData
} from '../helpers/autoscaler-helpers';
import { selectPaginationState } from '../selectors/pagination.selectors';
import { PaginationEntityState, PaginationParam } from '../types/pagination.types';
import { resultPerPageParam, resultPerPageParamDefault } from '../reducers/pagination-reducer/pagination-reducer.types';

const { proxyAPIVersion, autoscalerAPIVersion } = environment;
const commonPrefix = `/pp/${proxyAPIVersion}/proxy/${autoscalerAPIVersion}`;
const healthPrefix = `/pp/${proxyAPIVersion}/proxy`;

export function createFailedAutoscalerRequestMessage(requestType, error) {
  return `Unable to ${requestType}: ${error.status} ${error._body}`;
}

@Injectable()
export class AutoscalerEffects {
  constructor(
    private http: Http,
    private actions$: Actions,
    private store: Store<AppState>,
    private logger: LoggerService,
  ) { }

  @Effect()
  fetchAppAutoscalerHealth$ = this.actions$
    .ofType<GetAppAutoscalerHealthAction>(APP_AUTOSCALER_HEALTH).pipe(
      mergeMap(action => {
        const actionType = 'fetch';
        const apiAction = {
          entityKey: action.entityKey,
          type: action.type,
          guid: action.appGuid
        } as ICFAction;
        this.store.dispatch(new StartRequestAction(apiAction, actionType));
        const options = new RequestOptions();
        options.url = `${healthPrefix}/health`;
        options.method = 'get';
        options.headers = this.addHeaders(action.cfGuid);
        return this.http
          .request(new Request(options)).pipe(
            mergeMap(response => {
              const healthInfo = response.json();
              const mappedData = {
                entities: { [action.entityKey]: {} },
                result: []
              } as NormalizedResponse;
              this.transformData(action.entityKey, mappedData, action.appGuid, healthInfo);
              return [
                new WrapperRequestActionSuccess(mappedData, apiAction, actionType)
              ];
            }),
            catchError(err => [
              new WrapperRequestActionFailed(createFailedAutoscalerRequestMessage('fetch health info', err), apiAction, actionType)
            ]));
      }));

  @Effect()
  updateAppAutoscalerPolicy$ = this.actions$
    .ofType<UpdateAppAutoscalerPolicyAction>(UPDATE_APP_AUTOSCALER_POLICY).pipe(
      mergeMap(action => {
        const actionType = 'update';
        const apiAction = {
          entityKey: action.entityKey,
          type: action.type,
          guid: action.appGuid
        } as ICFAction;
        this.store.dispatch(new StartRequestAction(apiAction, actionType));
        const options = new RequestOptions();
        options.url = `${commonPrefix}/apps/${action.appGuid}/policy`;
        options.method = 'put';
        options.headers = this.addHeaders(action.cfGuid);
        options.body = autoscalerTransformMapToArray(action.policy);
        return this.http
          .request(new Request(options)).pipe(
            mergeMap(response => {
              const policyInfo = autoscalerTransformArrayToMap(response.json(), undefined);
              const mappedData = {
                entities: { [action.entityKey]: {} },
                result: []
              } as NormalizedResponse;
              this.transformData(action.entityKey, mappedData, action.appGuid, policyInfo);
              return [
                new WrapperRequestActionSuccess(mappedData, apiAction, actionType)
              ];
            }),
            catchError(err => [
              new WrapperRequestActionFailed(createFailedAutoscalerRequestMessage('update policy', err), apiAction, actionType)
            ]));
      }));

  @Effect()
  getAppAutoscalerPolicy$ = this.actions$
    .ofType<GetAppAutoscalerPolicyAction>(APP_AUTOSCALER_POLICY).pipe(
      mergeMap(action => {
        const actionType = 'fetch';
        const apiAction = {
          entityKey: action.entityKey,
          type: action.type,
          guid: action.appGuid
        } as ICFAction;
        this.store.dispatch(new StartRequestAction(apiAction, actionType));
        const options = new RequestOptions();
        options.url = `${commonPrefix}/apps/${action.appGuid}/policy`;
        options.method = 'get';
        options.headers = this.addHeaders(action.cfGuid);
        return this.http
          .request(new Request(options)).pipe(
            mergeMap(response => {
              const policyInfo = autoscalerTransformArrayToMap(response.json(), undefined);
              const mappedData = {
                entities: { [action.entityKey]: {} },
                result: []
              } as NormalizedResponse;
              this.transformData(action.entityKey, mappedData, action.appGuid, policyInfo);
              return [
                new WrapperRequestActionSuccess(mappedData, apiAction, actionType)
              ];
            }),
            catchError(err => {
              if (err.status === 404 && err._body === '{}') {
                return [
                  new WrapperRequestActionFailed('No policy is defined for this application.', apiAction, actionType)
                ];
              } else {
                return [
                  new WrapperRequestActionFailed(createFailedAutoscalerRequestMessage('fetch policy', err), apiAction, actionType)
                ];
              }
            }));
      }));


  @Effect()
  detachAppAutoscalerPolicy$ = this.actions$
    .ofType<DetachAppAutoscalerPolicyAction>(DETACH_APP_AUTOSCALER_POLICY).pipe(
      mergeMap(action => {
        const actionType = 'update';
        const apiAction = {
          entityKey: action.entityKey,
          type: action.type,
          guid: action.appGuid
        } as ICFAction;
        this.store.dispatch(new StartRequestAction(apiAction, actionType));
        const options = new RequestOptions();
        options.url = `${commonPrefix}/apps/${action.appGuid}/policy`;
        options.method = 'delete';
        options.headers = this.addHeaders(action.cfGuid);
        return this.http
          .request(new Request(options)).pipe(
            mergeMap(response => {
              const mappedData = {
                entities: { [action.entityKey]: {} },
                result: []
              } as NormalizedResponse;
              this.transformData(action.entityKey, mappedData, action.appGuid, { enabled: false });
              return [
                new WrapperRequestActionSuccess(mappedData, apiAction, actionType)
              ];
            }),
            catchError(err => [
              new WrapperRequestActionFailed(createFailedAutoscalerRequestMessage('update policy', err), apiAction, actionType)
            ]));
      }));

  @Effect()
  fetchAppAutoscalerScalingHistory$ = this.actions$
    .ofType<GetAppAutoscalerScalingHistoryAction>(APP_AUTOSCALER_SCALING_HISTORY).pipe(
      withLatestFrom(this.store),
      mergeMap(([action, state]) => {
        const actionType = 'fetch';
        const apiAction = action as ICFAction;
        const paginatedAction = action as PaginatedAction;
        this.store.dispatch(new StartRequestAction(apiAction, actionType));
        const options = new RequestOptions();
        options.url = `${commonPrefix}/apps/${action.appGuid}/scaling_histories`;
        options.method = 'get';
        options.headers = this.addHeaders(action.cfGuid);
        // Set params from store
        const paginationState = selectPaginationState(
          apiAction.entityKey,
          paginatedAction.paginationKey,
        )(state);
        const paginationParams = this.getPaginationParams(paginationState);
        paginatedAction.pageNumber = paginationState
          ? paginationState.currentPage
          : 1;
        options.params = this.buildParams(action.initialParams, action.params, paginationParams);
        if (!options.params.has(resultPerPageParam)) {
          options.params.set(
            resultPerPageParam,
            resultPerPageParamDefault.toString(),
          );
        }
        if (options.params.has('order-direction-field')) {
          options.params.delete('order-direction-field');
        }
        if (options.params.has('order-direction')) {
          options.params.set('order', options.params.get('order-direction'));
          options.params.delete('order-direction');
        }
        return this.http
          .request(new Request(options)).pipe(
            mergeMap(response => {
              const histories = response.json();
              const mappedData = {
                entities: { [action.entityKey]: {} },
                result: []
              } as NormalizedResponse;
              if (action.normalFormat) {
                this.transformData(action.entityKey, mappedData, action.appGuid, histories);
              } else {
                this.transformEventData(action.entityKey, mappedData, action.appGuid, histories);
              }
              return [
                new WrapperRequestActionSuccess(mappedData, apiAction, actionType, histories['total_results'], histories['total_pages'])
              ];
            }),
            catchError(err => [
              new WrapperRequestActionFailed(createFailedAutoscalerRequestMessage('fetch scaling history', err), apiAction, actionType)
            ]));
      }));

  @Effect()
  fetchAppAutoscalerAppMetric$ = this.actions$
    .ofType<GetAppAutoscalerMetricAction>(FETCH_APP_AUTOSCALER_METRIC).pipe(
      mergeMap(action => {
        const actionType = 'fetch';
        const apiAction = {
          entityKey: action.entityKey,
          type: action.type,
          paginationKey: action.paginationKey,
          guid: action.appGuid
        } as PaginatedAction;
        this.store.dispatch(new StartRequestAction(apiAction, actionType));
        const options = new RequestOptions();
        options.url = `${commonPrefix}/${action.url}`;
        options.method = 'get';
        options.headers = this.addHeaders(action.cfGuid);
        options.params = this.buildParams(action.initialParams, action.params);
        return this.http
          .request(new Request(options)).pipe(
            mergeMap(response => {
              const data = response.json();
              const mappedData = {
                entities: { [action.entityKey]: {} },
                result: []
              } as NormalizedResponse;
              this.addMetric(action.entityKey, mappedData, action.appGuid, action.metricName, data,
                action.initialParams['start-time'], action.initialParams['end-time'], action.skipFormat, action.trigger);
              return [
                new WrapperRequestActionSuccess(mappedData, apiAction, actionType)
              ];
            }),
            catchError(err => [
              new WrapperRequestActionFailed(createFailedAutoscalerRequestMessage('fetch metrics', err), apiAction, actionType)
            ]));
      }));

  addMetric(schemaKey: string, mappedData: NormalizedResponse, appid, metricName, data, startTime, endTime, skipFormat, trigger) {
    const id = appid + '-' + metricName;
    mappedData.entities[schemaKey][id] = {
      entity: buildMetricData(metricName, data, startTime, endTime, skipFormat, trigger),
      metadata: {}
    };
    mappedData.result.push(id);
  }

  transformData(key: string, mappedData: NormalizedResponse, appGuid: string, data: any) {
    mappedData.entities[key][appGuid] = {
      entity: data,
      metadata: {}
    };
    mappedData.result.push(appGuid);
  }

  transformEventData(key: string, mappedData: NormalizedResponse, appGuid: string, data: any) {
    mappedData.entities[key] = [];
    data.resources.map((item) => {
      mappedData.entities[key][item.timestamp] = {
        entity: item,
        metadata: {
          created_at: item.timestamp,
          guid: item.timestamp,
          updated_at: item.timestamp
        }
      };
    });
    mappedData.result = Object.keys(mappedData.entities[key]);
  }

  addHeaders(cfGuid: string) {
    const headers = new Headers();
    headers.set('x-cap-api-host', 'autoscaler');
    headers.set('x-cap-passthrough', 'true');
    headers.set('x-cap-cnsi-list', cfGuid);
    return headers;
  }

  buildParams(initialParams, params?, paginationParams?) {
    const searchParams = new URLSearchParams();
    if (initialParams) {
      Object.keys(initialParams).map((key) => {
        searchParams.set(key, initialParams[key]);
      });
    }
    if (params) {
      Object.keys(params).map((key) => {
        searchParams.set(key, params[key]);
      });
    }
    if (paginationParams) {
      Object.keys(paginationParams).map((key) => {
        searchParams.set(key, paginationParams[key]);
      });
    }
    return searchParams;
  }

  getPaginationParams(paginationState: PaginationEntityState): PaginationParam {
    return paginationState
      ? {
        ...paginationState.params,
        q: [
          ...(paginationState.params.q || [])
        ],
        page: paginationState.currentPage.toString(),
      }
      : {};
  }

}
