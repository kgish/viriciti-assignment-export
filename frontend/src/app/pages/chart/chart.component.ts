import { AfterViewInit, Component, OnInit } from '@angular/core';

import { Chart, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: [ './chart.component.scss' ]
})
export class ChartComponent implements OnInit, AfterViewInit {

  private seed;

  private chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
  };

  private options: ChartOptions = {
    type: 'line',
    data: {
      labels: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July' ],
      datasets: [ {
        label: 'First dataset',
        backgroundColor: this.chartColors.red,
        borderColor: this.chartColors.red,
        data: [
          this._randomScalingFactor(),
          this._randomScalingFactor(),
          this._randomScalingFactor(),
          this._randomScalingFactor(),
          this._randomScalingFactor(),
          this._randomScalingFactor(),
          this._randomScalingFactor()
        ],
        fill: false,
      }, {
        label: 'Second dataset',
        fill: false,
        backgroundColor: this.chartColors.blue,
        borderColor: this.chartColors.blue,
        data: [
          this._randomScalingFactor(),
          this._randomScalingFactor(),
          this._randomScalingFactor(),
          this._randomScalingFactor(),
          this._randomScalingFactor(),
          this._randomScalingFactor(),
          this._randomScalingFactor()
        ],
      } ]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Chart.js Line Chart'
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [ {
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Month'
          }
        } ],
        yAxes: [ {
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Value'
          }
        } ]
      }
    }
  };

  chart: Chart;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.chart = new Chart('chart', this.options);
  }

  // Private

  _rand(min, max) {
    const seed = this.seed;
    min = min === undefined ? 0 : min;
    max = max === undefined ? 1 : max;
    this.seed = (seed * 9301 + 49297) % 233280;
    return min + (this.seed / 233280) * (max - min);
  }

  _randomScalingFactor() {
    return Math.round(this._rand(-100, 100));
  }
}
