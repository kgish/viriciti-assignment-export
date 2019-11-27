import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

const chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

export interface IChartData {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {


  constructor() {
  }

  renderChart(id: string, data: IChartData[]): Chart {
    return new Chart(id, this._config(data));
  }

  // Private

  _config(data: IChartData[]): ChartConfiguration {
    return {
      type: 'line',
      data: {
        labels: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July' ],
        datasets: [ {
          backgroundColor: chartColors.blue,
          borderColor: chartColors.blue,
          data,
          fill: false,
        } ]
      },
      options: {
        responsive: true,
        legend: {display: false},
        title: { display: false },
        tooltips: { mode: 'index', intersect: false, },
        hover: { mode: 'nearest', intersect: true },
        scales: {
          xAxes: [ {
            display: true,
            scaleLabel: { display: true, labelString: 'Time' }
          } ],
          yAxes: [ {
            display: true,
            scaleLabel: { display: true, labelString: 'Value' }
          } ]
        }
      }
    };
  }
}
