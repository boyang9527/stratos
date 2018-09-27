import { Component, Input, OnInit } from '@angular/core';
import { MetricsLineChartConfig } from '../../../../../shared/components/metrics-chart/metrics-chart.types';
import { MetricsConfig } from '../../../../../shared/components/metrics-chart/metrics-chart.component';
import { IMetricMatrixResult } from '../../../../../store/types/base-metric.types';
import { IMetricApplication } from '../../../../../store/types/metric.types';
import { MetricsChartHelpers } from '../../../../../shared/components/metrics-chart/metrics.component.helpers';
import { FetchCFMetricsAction, MetricQueryConfig, MetricQueryType } from '../../../../../store/actions/metrics.actions';


@Component({
  selector: 'app-cf-cell-summary-chart',
  templateUrl: './cf-cell-summary-chart.component.html',
  styleUrls: ['./cf-cell-summary-chart.component.scss']
})
export class CfCellSummaryChartComponent implements OnInit {

  @Input()
  private cellId: string;

  @Input()
  private endpointGuid: string;

  @Input()
  private yAxisLabel: string;

  // Prometheus query string
  @Input()
  private queryString: string;

  @Input()
  private seriesTranslation: string;

  @Input()
  private queryRange = false;

  @Input()
  public title: string;

  public instanceChartConfig: MetricsLineChartConfig;

  public instanceMetricConfig: MetricsConfig<IMetricMatrixResult<IMetricApplication>>;

  constructor() { }

  private buildChartConfig() {
    const lineChartConfig = new MetricsLineChartConfig();
    lineChartConfig.xAxisLabel = 'Time';
    lineChartConfig.yAxisLabel = this.yAxisLabel;
    return lineChartConfig;
  }

  ngOnInit() {
    this.instanceChartConfig = this.buildChartConfig();
    this.instanceMetricConfig = {
      getSeriesName: result => `Cell ${result.metric.bosh_job_id}`,
      mapSeriesItemName: MetricsChartHelpers.getDateSeriesName,
      sort: MetricsChartHelpers.sortBySeriesName,
      // mapSeriesItemValue: this.mapSeriesItemValue(),
      metricsAction: new FetchCFMetricsAction(
        this.endpointGuid,
        new MetricQueryConfig(this.queryString),
        // TODO: RC MetricQueryType.RANGE_QUERY causes failure
        // this.queryRange ? MetricQueryType.RANGE_QUERY : MetricQueryType.QUERY
        MetricQueryType.QUERY
      ),
    };
  }

  private mapSeriesItemValue() {
    switch (this.seriesTranslation) {
      case 'mb':
        return (bytes) => (bytes / 1000000).toFixed(2);
      default:
        return undefined;
    }
  }

}