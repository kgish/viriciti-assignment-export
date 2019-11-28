import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration, TimeUnit } from 'chart.js';

const chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

// units: Unit[] = [ 'msec', 'sec', 'min', 'hour', 'day' ];
const convertUnits = {
  msec: 'millisecond',
  sec: 'second',
  min: 'minute',
  hour: 'hour',
  day: 'day'
};

const fn = 'ChartService';

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

  renderChart(id: string, data: IChartData[], unit = 'msec', color = 'blue'): Chart {
    let convertedUnit: TimeUnit = convertUnits[unit];
    if (!convertedUnit) {
      console.error(`${fn} renderChart() invalid unit='${unit}'`);
      convertedUnit = 'millisecond';
    }
    let convertedColor = chartColors[color];
    if (!convertedColor) {
      console.error(`${fn} renderChart() invalid color='${color}'`);
      convertedColor = 'blue';
    }
    return new Chart(id, this._config(data, convertedUnit, convertedColor));
  }

  // Private

  _config(data: IChartData[], unit: TimeUnit = 'millisecond', color = chartColors.blue): ChartConfiguration {
    return {
      type: 'line',
      data: {
        datasets: [ {
          data,
          backgroundColor: color,
          borderColor: color,
          lineTension: 0,
          fill: false,
        } ]
      },
      options: {
        responsive: true,
        legend: { display: false },
        title: { display: false },
        tooltips: { mode: 'index', intersect: false, },
        hover: { mode: 'nearest', intersect: true },
        scales: {
          xAxes: [ {
            type: 'time',
            time: { unit },
            ticks: { source: 'data' },
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
