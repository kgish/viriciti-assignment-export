import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
  };

  private config: ChartConfiguration = {
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


  constructor() {
  }

  renderChart(id: string): Chart {
    return new Chart(id, this.config);
  }

  // Private

  _randomScalingFactor() {
    return Math.round(-100 + 200 * Math.random());
  }
}
