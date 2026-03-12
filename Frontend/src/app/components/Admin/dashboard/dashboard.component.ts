import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ChartModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  users = [
    { name: 'John Doe', email: 'john@mail.com', status: 'Active', role: 'Admin' },
    { name: 'Anna Smith', email: 'anna@mail.com', status: 'Active', role: 'User' },
    { name: 'Mike Brown', email: 'mike@mail.com', status: 'Active', role: 'Editor' },
    { name: 'Lisa White', email: 'lisa@mail.com', status: 'Active', role: 'User' }
  ];

  chartData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [1200,1900,3000,5000,2300,4200],
        borderColor: '#d4a84f',
        backgroundColor: 'rgba(212,168,79,0.2)',
        tension: .4
      }
    ]
  };

  chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#ccc'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#aaa' },
        grid: { color: '#222' }
      },
      y: {
        ticks: { color: '#aaa' },
        grid: { color: '#222' }
      }
    }
  };
}
