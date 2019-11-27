import { AfterViewInit, Component, OnInit } from '@angular/core';

import { ChartService } from '../../services';


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: [ './chart.component.scss' ]
})
export class ChartComponent implements OnInit, AfterViewInit {

  constructor(private chartService: ChartService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.chartService.renderChart('chart');
  }
}
