import { AfterViewInit, Component, OnInit } from '@angular/core';

import { ChartService, IChartData } from '../../services';


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: [ './chart.component.scss' ]
})
export class ChartComponent implements OnInit, AfterViewInit {

  data: IChartData[];

  constructor(private chartService: ChartService) {
  }

  ngOnInit() {
    this.data = [
      { x: 1, y: this._randomScalingFactor() },
      { x: 2, y: this._randomScalingFactor() },
      { x: 3, y: this._randomScalingFactor() },
      { x: 4, y: this._randomScalingFactor() },
      { x: 5, y: this._randomScalingFactor() },
      { x: 6, y: this._randomScalingFactor() },
      { x: 9, y: this._randomScalingFactor() },
    ];
  }

  ngAfterViewInit(): void {
    this.chartService.renderChart('chart', this.data);
  }

  // Private

  _randomScalingFactor() {
    return Math.round(-100 + 200 * Math.random());
  }
}
